#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>
#include <DHT.h>

int waterLevel_1 = A0;
int waterLevel_2 = A1;
int waterLevel_3 = A2;

#define proxEcho 2
#define proxTrig 3
#define buzzer 5
#define soilMoistureLight_2 5
#define soilMoistureLight_1 4
#define ledLight_1 6
#define soilMoisture_2 10
#define soilMoisture_1 9
#define soilMoisture_3 11
#define PIN_DHT22 8
#define TYPE_DHT22 DHT22
#define waterPump 7
#define valve1 13

#define waterLevelValue_High 9
#define waterLevelValue_Medium 6 
#define waterLevelValue_Low 3

int waterLevel_1_value; 
int currentWaterLevel_1;
int soilMoistureState_1;
int distance;
long duration;

int waterLevel_2_value;
int currentWaterLevel_2;
int soilMoistureState_2;

int waterLevel_3_value;
int currentWaterLevel_3;
int soilMoistureState_3;

float humidity;
float temperature;

unsigned long previousUpdate;
int currentDisplayedValue;

bool isPumpOn;

LiquidCrystal_I2C lcd (0x27, 16, 2);
DHT dht(PIN_DHT22, TYPE_DHT22);

int readReservoirLevel(){
  digitalWrite(proxTrig, LOW);
  delayMicroseconds(2);

  digitalWrite(proxTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(proxTrig, LOW);

  duration = pulseIn(proxEcho, HIGH);

  // Calculate distance in cm
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  return distance;
}

void readDHT22(){
  float rawHumidity = dht.readHumidity();
  float rawTemperature = dht.readTemperature(); // Celsius

  if (isnan(rawHumidity) || isnan(rawTemperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  humidity = rawHumidity;
  temperature = rawTemperature;

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
}

void setup() {
  Serial.begin(9600);
  pinMode(buzzer, OUTPUT);
  pinMode(ledLight_1, OUTPUT);
  pinMode(soilMoistureLight_1, OUTPUT);
  pinMode(soilMoisture_1, INPUT);
  pinMode(proxTrig, OUTPUT);
  pinMode(proxEcho, INPUT);
  pinMode(soilMoisture_2, INPUT);
  pinMode(soilMoistureLight_2, OUTPUT);
  pinMode(soilMoisture_3, INPUT);
  pinMode(waterPump, OUTPUT);
  pinMode(valve1, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print(" Initializing...");

  dht.begin();
  
  digitalWrite(waterPump, LOW);
  waterLevel_1_value = 0;
  currentWaterLevel_1 = waterLevelValue_High;
  soilMoistureState_1 = 0;
  duration=0;
  distance=10;
  waterLevel_2_value = 0;
  currentWaterLevel_2 = waterLevelValue_High;
  soilMoistureState_2 = 0;
  waterLevel_3_value = 0;
  currentWaterLevel_3 = waterLevelValue_High;
  soilMoistureState_3 = 0;
  humidity=0;
  temperature=0;
  previousUpdate = 0;
  currentDisplayedValue = 0;
  isPumpOn = false;
}

void loop() {
  
  waterLevel_1_value = analogRead(waterLevel_1);
  Serial.print("Water Level 1:");
  Serial.println(waterLevel_1_value);
  delay(60);
  waterLevel_2_value = analogRead(waterLevel_2);
  Serial.print("Water Level 2:");
  Serial.println(waterLevel_2_value);
  delay(60);
  waterLevel_3_value = analogRead(waterLevel_3);
  Serial.print("Water Level 3:");
  Serial.println(waterLevel_3_value);
  delay(60);
  soilMoistureState_1 = digitalRead(soilMoisture_1);
  delay(100);
  soilMoistureState_2 = digitalRead(soilMoisture_2);
  delay(100);
  soilMoistureState_3 = digitalRead(soilMoisture_3);

  distance = readReservoirLevel();
  Serial.print("Reservoir: ");
  Serial.println(distance);

  delay(60);
  readDHT22();

  if(waterLevel_1_value >300){
    currentWaterLevel_1 = waterLevelValue_High;
  }else if(waterLevel_1_value > 270){
    currentWaterLevel_1 = waterLevelValue_Medium;
    
  }else{
    currentWaterLevel_1 = waterLevelValue_Low;
  }

  if(waterLevel_2_value >300){
    currentWaterLevel_2 = waterLevelValue_High;
    digitalWrite(valve1, HIGH);
  }else if(waterLevel_2_value > 270){
    currentWaterLevel_2 = waterLevelValue_Medium;
  }else{
    currentWaterLevel_2 = waterLevelValue_Low;
    digitalWrite(valve1, LOW);
  }

  if(waterLevel_3_value >300){
    currentWaterLevel_3 = waterLevelValue_High;
  }else if(waterLevel_3_value > 270){
    currentWaterLevel_3 = waterLevelValue_Medium;
    
  }else{
    currentWaterLevel_3 = waterLevelValue_Low;
  }

//--------------------------------------------------------------------------------------------------
  if(currentWaterLevel_1 == waterLevelValue_High || currentWaterLevel_2 == waterLevelValue_High){
    if(currentWaterLevel_1 == waterLevelValue_High){
      digitalWrite(soilMoistureLight_1, HIGH);  
    }
    if(currentWaterLevel_2 == waterLevelValue_High){
      digitalWrite(soilMoistureLight_2, HIGH);  
    }
    delay(2000);
    if(currentWaterLevel_1 == waterLevelValue_High){
      digitalWrite(soilMoistureLight_1, LOW);  
    }
    if(currentWaterLevel_2 == waterLevelValue_High){
      digitalWrite(soilMoistureLight_2, LOW);  
    }
  }


  if(currentWaterLevel_1 == waterLevelValue_Medium || currentWaterLevel_2 == waterLevelValue_Medium){
    for(int i=0;i<3;i++){
      if(currentWaterLevel_1 == waterLevelValue_Medium){
        digitalWrite(soilMoistureLight_1, HIGH);  
      }
      if(currentWaterLevel_2 == waterLevelValue_Medium){
        digitalWrite(soilMoistureLight_2, HIGH);  
      }
      delay(300);
      if(currentWaterLevel_1 == waterLevelValue_Medium){
        digitalWrite(soilMoistureLight_1, LOW);  
      }
      if(currentWaterLevel_2 == waterLevelValue_Medium){
        digitalWrite(soilMoistureLight_2, LOW);  
      }
      delay(200);
    }
  }

  if(currentWaterLevel_1 == waterLevelValue_Low || currentWaterLevel_2 == waterLevelValue_Low){
    for(int i=0;i<3;i++){
      if(currentWaterLevel_1 == waterLevelValue_Low){
        digitalWrite(soilMoistureLight_1, HIGH);  
      }
      if(currentWaterLevel_2 == waterLevelValue_Low){
        digitalWrite(soilMoistureLight_2, HIGH);  
      }
      delay(300);
      if(currentWaterLevel_1 == waterLevelValue_Low){
        digitalWrite(soilMoistureLight_1, LOW);  
      }
      if(currentWaterLevel_2 == waterLevelValue_Low){
        digitalWrite(soilMoistureLight_2, LOW);  
      }
      delay(100);
    }
  }
//--------------------------------------------------------------------------------------------------  


  if(soilMoistureState_1 == HIGH || soilMoistureState_2 == HIGH || soilMoistureState_3 == HIGH){
    if(soilMoistureState_1 == HIGH){
      Serial.println("Soil 1 is dry!");
      lcd.setCursor(0, 0);
      lcd.print("[DRY]");
    }
    if(soilMoistureState_2 == HIGH){
      Serial.println("Soil 2 is dry!");
      lcd.setCursor(5, 0);
      lcd.print("[DRY]      ");
    }
    if(soilMoistureState_3 == HIGH){
      Serial.println("Soil 3 is dry!");
      lcd.setCursor(10, 0);
      lcd.print("[DRY]");
    }
    
    for(int i=0;i<5;i++){
      if(soilMoistureState_1 == HIGH){
        digitalWrite(soilMoistureLight_1, HIGH);
      }
      if(soilMoistureState_2 == HIGH){
        digitalWrite(soilMoistureLight_2, HIGH);
      }
      tone(buzzer, 1000);
      delay(400);
      if(soilMoistureState_1 == HIGH){
        digitalWrite(soilMoistureLight_1, LOW);
      }
      if(soilMoistureState_2 == HIGH){
        digitalWrite(soilMoistureLight_2, LOW);
      }
      noTone(buzzer);
      delay(100);
    }
  }
  
    if(soilMoistureState_1 == LOW){
      if(currentWaterLevel_1 > waterLevelValue_Low){
        Serial.println("Soil 1 is ok");
        lcd.setCursor(0, 0);
        lcd.print("[OK] ");  
      }else{
        Serial.println("Soil 1 is ok");
        lcd.setCursor(0, 0);
        lcd.print("[LOW]");
      }
      digitalWrite(soilMoistureLight_1, HIGH);
    }
    
    if(soilMoistureState_2 == LOW){
      if(currentWaterLevel_2 > waterLevelValue_Low){
        Serial.println("Soil 2 is ok");
        lcd.setCursor(5, 0);
        lcd.print("[OK] ");  
      }else{
        Serial.println("Soil 2 is ok");
        lcd.setCursor(5, 0);
        lcd.print("[LOW]");
      }
      digitalWrite(soilMoistureLight_2, HIGH);
    }

    if(soilMoistureState_3 == LOW){
      if(currentWaterLevel_3 > waterLevelValue_Low){
        Serial.println("Soil 3 is ok");
        lcd.setCursor(10, 0);
        lcd.print("[OK] ");  
      }else{
        Serial.println("Soil 3 is ok");
        lcd.setCursor(10, 0);
        lcd.print("[LOW]");
      }
      //digitalWrite(soilMoistureLight_3, HIGH);
    }
  
  if(millis() - previousUpdate >= 5000){
    if(currentDisplayedValue == 0){
      lcd.setCursor(0, 1);
      lcd.print("Humidity:       ");
      lcd.setCursor(10, 1);
      lcd.print(humidity);
    }else if(currentDisplayedValue == 1){
      lcd.setCursor(0, 1);
      lcd.print("Temp:           ");
      lcd.setCursor(6, 1);
      lcd.print(temperature);
    }else{
      if(distance>=6){
        Serial.println("Reservoir: Low");
        lcd.setCursor(0, 1);
        lcd.print("Reservoir: LOW  ");
        digitalWrite(waterPump, LOW);
        for(int i=0;i<4;i++){
          digitalWrite(ledLight_1, HIGH);
          delay(400);
          digitalWrite(ledLight_1, LOW);
          delay(100);
        }  
      }else if(distance<=2){
        Serial.println("Reservoir: full");
        lcd.setCursor(0, 1);
        lcd.print("Reservoir: FULL ");
        digitalWrite(waterPump, LOW);  
      }else{
        Serial.println("Reservoir: ok");
        lcd.setCursor(0, 1);
        lcd.print("Reservoir: OK   "); 
      } 
    }

    currentDisplayedValue++;
    previousUpdate = millis();

    if(currentDisplayedValue > 2){
      currentDisplayedValue = 0;
    }
  }

  delay(1000); 
}