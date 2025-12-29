#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>


const char* WIFI_SSID = "WIFIALIABO 2.4G";
const char* WIFI_PASS = "KAPITANDANDAN";

const char* API_URL = "https://test-project-xpyo.onrender.com";

const int JSON_REQUEST_SIZE = 512 + (64 * 15);

void wifiConnect() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to WiFi. Restarting...");
        delay(5000);
        ESP.restart();
    }
    Serial.println("------------------------------------");
}

void requestAPIGET(String endPoint) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Reconnecting...");
        wifiConnect();
        return;
    }
        
    String urlFull=API_URL+endPoint;
    HTTPClient http;
    http.begin(urlFull);

    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("HTTP Response Code: %d\n", httpResponseCode);
        
        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error) {
            Serial.print(F("JSON parsing failed: "));
            Serial.println(error.f_str());
        } else {
            if (httpResponseCode == 200) {
                String message = responseDoc["message"];
                Serial.println(message.c_str());
            } else {
                String errorMsg = responseDoc["message"] | "Unknown API Error";
                Serial.printf("API Error: %s\n", errorMsg.c_str());
            }
        }
    } else {
        Serial.printf("HTTP GET Request failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

void sendOnlinePing(){
    DynamicJsonDocument doc(JSON_REQUEST_SIZE);
    doc["deviceID"]="10000-01";
    sendAPIPOST("/device/online", doc);
}

void sendAPIPOST(String endPoint, DynamicJsonDocument doc){
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Reconnecting...");
        wifiConnect();
        return;
    }

    String urlFull = API_URL + endPoint;

    String jsonRequest;
    serializeJson(doc, jsonRequest);

    Serial.print("POST URL: ");
    Serial.println(urlFull);
    Serial.print("JSON Body: ");
    Serial.println(jsonRequest);

    HTTPClient http;

    WiFiClientSecure client;
    client.setInsecure();

    if (!http.begin(client, urlFull)) {
        Serial.println("Failed to begin HTTP connection!");
        return;
    }

    http.addHeader("Content-Type", "application/json");

    
    int httpResponseCode = http.POST(jsonRequest);

    if (httpResponseCode > 0) {
        Serial.printf("HTTP Response Code: %d\n", httpResponseCode);

        String response = http.getString();
        Serial.println("Raw Response:");
        Serial.println(response);

        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error) {
            Serial.print("JSON parsing failed: ");
            Serial.println(error.c_str());
        } else {
            const char* message = responseDoc["message"] | "No message";
            Serial.printf("Server Message: %s\n", message);
        }

    } else {
        Serial.printf("HTTP Request failed: %s\n",
                      http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

void setup() {
  Serial.begin(115200);
  delay(100);
  wifiConnect();
}

void loop() {
  // put your main code here, to run repeatedly:
  requestAPIGET("/");
  sendOnlinePing();
  delay(5000);
}
