#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

const char* WIFI_SSID = "Clare";
const char* WIFI_PASS = "123456789";
//const char* WIFI_SSID = "Fil-Wifi 2.4G";
//const char* WIFI_PASS = "@Samuel1959";

const char* API_URL = "https://xlgjn5k1-5000.asse.devtunnels.ms/api";

const int JSON_REQUEST_SIZE = 512 + (64 * 15);

const String deviceID="10001a";

float temperature;
float humidity;
int waterLevel1;
int waterLevel2;
int isRaining;
int soilMoist1;
int soilMoist2;
int soilMoist3;
int soilMoist4;
int soilMoist5;
int soilMoist6;
int isIrrigating1;
int isIrrigating2;
int isIrrigating3;
int isIrrigating4;
int isIrrigating5;
int isIrrigating6;

String arduinoMessage;

int loopCounter;
unsigned long previousOnlineUpdate, previousDisplayUpdate;
unsigned long currentTime;

unsigned long previousDataSubmit;

bool connectedToWifi;

int currentDisplayIndex;

LiquidCrystal_I2C lcd(0x27, 16, 2);

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
        connectedToWifi=true;
    } else {
      Serial.println("\nFailed to connect to WiFi disabling wifi connection...");
        //Serial.println("\nFailed to connect to WiFi. Restarting...");
        //delay(5000);
        //ESP.restart();
        connectedToWifi=false;
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
    Serial.println("Sending post");
    DynamicJsonDocument doc(JSON_REQUEST_SIZE);
    doc["deviceID"]=deviceID;
    doc["temperature"]=temperature;
    doc["humidity"]=humidity;
    doc["waterLevel1"]=waterLevel1;
    doc["waterLevel2"]=waterLevel2;
    doc["isRaining"]=isRaining;
    doc["soilMoist1"]=soilMoist1;
    doc["soilMoist2"]=soilMoist2;
    doc["soilMoist3"]=soilMoist3;
    doc["soilMoist4"]=soilMoist4;
    doc["soilMoist5"]=0;
    doc["soilMoist6"]=0;
    doc["isPump1On"]=isIrrigating1;
    doc["isPump2On"]=isIrrigating2;
    doc["isPump3On"]=isIrrigating3;
    doc["isPump4On"]=isIrrigating4;
    doc["isPump5On"]=0;
    doc["isPump6On"]=0;
    
    sendAPIPOST("/device/online", doc);
}

void sendDataSubmission(){
    DynamicJsonDocument doc(JSON_REQUEST_SIZE);
    doc["deviceID"]=deviceID;
    doc["temperature"]=temperature;
    doc["humidity"]=humidity;
    /*doc["tankLevel"]=tankLevel;
    doc["isRaining"]=isRaining;
    doc["isIrrigating"]=isIrrigating;*/
    sendAPIPOST("/event/submit-data", doc);
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
  wifiConnect();
  delay(100);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");

  temperature=0;
  humidity=0;
  temperature;
  humidity;
  waterLevel1;
  waterLevel2;
  isRaining;
  soilMoist1;
  soilMoist2;
  soilMoist3;
  soilMoist4;
  soilMoist5;
  soilMoist6;
  isIrrigating1;
  isIrrigating2;
  isIrrigating3;
  isIrrigating4;
  isIrrigating5;
  isIrrigating6;
  
  arduinoMessage="";
  previousOnlineUpdate=0;
  currentTime=0;

  connectedToWifi=false;

  loopCounter=0;
  previousDataSubmit=0;
  currentDisplayIndex=0;
  previousDisplayUpdate=0;
}

void loop() {
  if (Serial2.available()) {
    String message = Serial2.readStringUntil('\n');
    Serial.print("from arduino: ");
    Serial.println(message);
    if(!arduinoMessage.equals(message) || loopCounter>=4){
      int firstComma = message.indexOf(',');
      int secondComma = message.indexOf(',', firstComma + 1);
      int thirdComma = message.indexOf(',', secondComma+1);
      int fourthComma = message.indexOf(',', thirdComma+1);
      int fifthComma = message.indexOf(',', fourthComma+1);
      int sixthComma = message.indexOf(',', fifthComma+1);
      int seventhComma = message.indexOf(',', sixthComma+1);
      int eightComma = message.indexOf(',', seventhComma+1);
      int ninethComma = message.indexOf(',', eightComma+1);
      int tenthComma = message.indexOf(',', ninethComma+1);
      int eleventhComma = message.indexOf(',', tenthComma+1);
     int twelvethComma = message.indexOf(',', eleventhComma+1);
     int thirteenthComma = message.indexOf(',', twelvethComma+1);
     int fourteenthComma = message.indexOf(',', thirteenthComma+1);
     int fifteenthComma = message.indexOf(',', fourteenthComma+1);
     int sixteenthComma = message.indexOf(',', fifteenthComma+1);

      humidity = message.substring(0, firstComma).toFloat();
      Serial.println(humidity);
      temperature=message.substring(firstComma+1, secondComma).toFloat();
      Serial.println(temperature);
      waterLevel1=message.substring(secondComma+1, thirdComma).toInt();
      Serial.println(waterLevel1);
      waterLevel2=message.substring(thirdComma+1, fourthComma).toInt();
      Serial.println(waterLevel2);
      isRaining=message.substring(fourthComma+1, fifthComma).toInt();
      Serial.println(isRaining);
      soilMoist1=message.substring(fifthComma+1, sixthComma).toInt();
      Serial.println(soilMoist1);
      soilMoist2=message.substring(sixthComma+1, seventhComma).toInt();
      Serial.println(soilMoist2);
      soilMoist3=message.substring(seventhComma+1, eightComma).toInt();
      Serial.println(soilMoist3);
      soilMoist4=message.substring(eightComma+1, ninethComma).toInt();
      Serial.println(soilMoist4);
      isIrrigating1=message.substring(ninethComma+1, tenthComma).toInt();
      Serial.println(isIrrigating1);
      isIrrigating2=message.substring(tenthComma+1, eleventhComma).toInt();
      Serial.println(isIrrigating2);
      isIrrigating3=message.substring(eleventhComma+1, twelvethComma).toInt();
      Serial.println(isIrrigating3);
      isIrrigating4=message.substring(twelvethComma+1, thirteenthComma).toInt();
      Serial.println(isIrrigating4);
      /*
      isIrrigating3=message.substring(thirteenthComma+1, fourteenthComma).toInt();
      Serial.println(isIrrigating3);
      isIrrigating4=message.substring(fourteenthComma+1, fifteenthComma).toInt();
      Serial.println(isIrrigating4);
      isIrrigating5=message.substring(fifteenthComma+1, sixteenthComma).toInt();
      Serial.println(isIrrigating5);
      isIrrigating6=message.substring(sixteenthComma+1).toInt();
      Serial.println(isIrrigating6);
      */
      //Serial.println("From arduino: "+message);
      arduinoMessage=message;
      loopCounter=0;
    }else{
      loopCounter++;
    }
  }

  currentTime=millis();
  if((currentTime-previousOnlineUpdate) >= 1500){
    
      sendOnlinePing();
    
    previousOnlineUpdate=currentTime;
  }

  if(currentTime-previousDataSubmit >= 43200000 || previousDataSubmit<=0){
    sendDataSubmission();
    previousDataSubmit=currentTime;
  }

    if(currentTime-previousDisplayUpdate>6000){
    lcd.setCursor(0, 0);
    if(currentDisplayIndex==0){
        lcd.print("H:");
        lcd.print(humidity);
        lcd.print("% T:");
        lcd.print(temperature);
        lcd.print("C");
        lcd.setCursor(0, 1);
        if(connectedToWifi){
            lcd.print("Online          ");
        }else{
            lcd.print("Offline         ");
        }
    }else if(currentDisplayIndex==1){
        lcd.print("Paddy1: lvl-");
        if(waterLevel1==2){
            lcd.print("FULL");
        }else if(waterLevel1==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 1-");
        if(soilMoist1==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else if(currentDisplayIndex==2){
        lcd.print("Paddy1: lvl-");
        if(waterLevel1==2){
            lcd.print("FULL");
        }else if(waterLevel1==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 2-");
        if(soilMoist2==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else if(currentDisplayIndex==3){
        lcd.print("Paddy1: lvl-");
        if(waterLevel1==2){
            lcd.print("FULL");
        }else if(waterLevel1==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 3-");
        if(soilMoist3==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else if(currentDisplayIndex==4){
        lcd.print("Paddy2: lvl-");
        if(waterLevel2==2){
            lcd.print("FULL");
        }else if(waterLevel2==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 4-");
        if(soilMoist4==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else if(currentDisplayIndex==5){
        lcd.print("Paddy2: lvl-");
        if(waterLevel2==2){
            lcd.print("FULL");
        }else if(waterLevel2==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 5-");
        if(soilMoist5==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else if(currentDisplayIndex==6){
        lcd.print("Paddy2: lvl-");
        if(waterLevel2==2){
            lcd.print("FULL");
        }else if(waterLevel2==1){
            lcd.print("OK  ");
        }else{
            lcd.print("LOW ");
        }
        lcd.setCursor(0, 1);
        lcd.print(" Moisture 6-");
        if(soilMoist6==1){
            lcd.print("OK  ");
        }else{
            lcd.print("DRY ");
        }
    }else{
        lcd.print("Weather: ");
        if(isRaining==1){
            lcd.print("Rainny ");
        }else{
            lcd.print("Sunny  ");
        }
        lcd.setCursor(0, 1);
        lcd.print("                ");
    }

    previousDisplayUpdate=currentTime;
    currentDisplayIndex++;
    if(currentDisplayIndex>6){
        currentDisplayIndex=0;
    }
  }

  delay(800);
}