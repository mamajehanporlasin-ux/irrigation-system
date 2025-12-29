#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>


const char* WIFI_SSID = "Channel-2.5Ghz";
const char* WIFI_PASS = "@Lbiga$iat0n";

const char* API_URL = "https://irrigation-system-oazw.onrender.com/api";

const int JSON_REQUEST_SIZE = 512 + (64 * 15);

const String deviceID="10001-01A";

float temperature;
float humidity;

String reservoirLevel;
bool soilMoisture1;
bool soilMoisture2;
bool soilMoisture3;

String waterLevel1;
String waterLevel2;
String waterLevel3;

String arduinoMessage;

long previousOnlineUpdate;
long currentTime;

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
    doc["deviceID"]=deviceID;
    doc["temperature"]=temperature;
    doc["humidity"]=humidity;
    doc["reservoirLevel"]=reservoirLevel;
    doc["soilMoisture1"]=soilMoisture1;
    doc["soilMoisture2"]=soilMoisture2;
    doc["soilMoisture3"]=soilMoisture3;
    doc["waterLevel1"]=waterLevel1;
    doc["waterLevel2"]=waterLevel2;
    doc["waterLevel3"]=waterLevel3;
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
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  wifiConnect();

  temperature=0;
  humidity=0;

    reservoirLevel="OK";
    soilMoisture1=true;
    soilMoisture2=true;
    soilMoisture3=true;

    waterLevel1="OK";
    waterLevel2="OK";
    waterLevel3="OK";

    arduinoMessage="";
    previousOnlineUpdate=0;
    currentTime=0;
}

void loop() {
    if(Serial2.available()){
        String message = Serial2.readStringUntil('\n');
        Serial.println("From arduino: "+message);
        if(!arduinoMessage.equals(message)){
            //int firstComma = message.indexOf(',');
            // int secondComma = message.indexOf(',', firstComma + 1);
            //value1 = message.substring(0, firstComma).toInt();
            //value2 = message.substring(firstComma + 1, secondComma).toInt();
            //value3 = message.substring(secondComma + 1).toInt();
        }
            
    }

    currentTime=millis();
  if((currentTime-previousOnlineUpdate) >= 6000){
    sendOnlinePing();
    previousOnlineUpdate=currentTime;
  }
  
  delay(2000);
}
