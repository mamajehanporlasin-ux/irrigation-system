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

#define PIN_DHT22 7
#define TYPE_DHT22 DHT22
#define waterPump 9
#define valve1 11
#define valve2 10
#define valve3 8

#define waterLevelValue_High 9
#define waterLevelValue_Medium 6 
#define waterLevelValue_Low 3

int waterLevel_1_value; 
int currentWaterLevel_1;
//int soilMoistureState_1;
int distance;
long duration;

int waterLevel_2_value;
int currentWaterLevel_2;
//int soilMoistureState_2;

int waterLevel_3_value;
int currentWaterLevel_3;
//int soilMoistureState_3;

float humidity;
float temperature;

unsigned long previousUpdate, dhtReadTime;
int currentDisplayedValue;

bool isPumpOn;

bool isStarted;

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

  //Serial.print("Distance: ");
  //Serial.print(distance);
  //Serial.println(" cm");

  return distance;
}

void readDHT22(){
  long now=millis();
  if(now-dhtReadTime<=2000){
    return;
  }
  float rawHumidity = dht.readHumidity();
  float rawTemperature = dht.readTemperature(); // Celsius

  if (isnan(rawHumidity) || isnan(rawTemperature)) {
    //Serial.println("Failed to read from DHT sensor!");
    Serial.print(humidity);
    Serial.print(",");
    Serial.print(temperature);
    Serial.print(",");
    return;
  }

  humidity = rawHumidity;
  temperature = rawTemperature;
  dhtReadTime=now;

  //Serial.print("Humidity: ");
  Serial.print(humidity);
  //Serial.print(" %\t");
  Serial.print(",");
  //Serial.print("Temperature: ");
  Serial.print(temperature);
  //Serial.println(" °C");
  Serial.print(",");
}

void setup() {
  Serial.begin(9600);
  delay(10000);
  pinMode(buzzer, OUTPUT);
  pinMode(ledLight_1, OUTPUT);
  pinMode(soilMoistureLight_1, OUTPUT);
  //pinMode(soilMoisture_1, INPUT);
  pinMode(proxTrig, OUTPUT);
  pinMode(proxEcho, INPUT);
  //pinMode(soilMoisture_2, INPUT);
  pinMode(soilMoistureLight_2, OUTPUT);
  //pinMode(soilMoisture_3, INPUT);
  pinMode(waterPump, OUTPUT);
  pinMode(valve1, OUTPUT);
  pinMode(valve2, OUTPUT);
  pinMode(valve3, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print(" Initializing...");

  dht.begin();
  
  digitalWrite(waterPump, HIGH);
  waterLevel_1_value = 0;
  currentWaterLevel_1 = waterLevelValue_High;
  //soilMoistureState_1 = 0;
  duration=0;
  distance=0;
  waterLevel_2_value = 0;
  currentWaterLevel_2 = waterLevelValue_High;
  //soilMoistureState_2 = 0;
  waterLevel_3_value = 0;
  currentWaterLevel_3 = waterLevelValue_High;
  //soilMoistureState_3 = 0;
  humidity=0;
  temperature=0;
  previousUpdate = 0;
  currentDisplayedValue = 0;
  isPumpOn = false;
  isStarted=false;
}

void loop() {

  waterLevel_1_value = analogRead(waterLevel_1);
  //Serial.println();
  //Serial.print("Water Level 1:");
  //Serial.println(waterLevel_1_value);
  delay(60);
  waterLevel_2_value = analogRead(waterLevel_2);
  //Serial.print("Water Level 2:");
  //Serial.println(waterLevel_2_value);
  delay(60);
  waterLevel_3_value = analogRead(waterLevel_3);
  //Serial.print("water Level 3: ");
  //Serial.println(waterLevel_3_value);
  //soilMoistureState_1 = digitalRead(soilMoisture_1);
  //soilMoistureState_2 = digitalRead(soilMoisture_2);
  //soilMoistureState_3 = digitalRead(soilMoisture_3);

  distance = readReservoirLevel();
  //Serial.print("Reservoir: ");
  //Serial.println(distance);
  
  delay(60);
  readDHT22();
  
  //22 cm is the max depth of the water bottle used for tank/reservoir pag read sa ultrasonic sensor. to get the level of water naa sulod sa bottle. we subtract the reading to the max depth 
  //will give us the height of the water inside sa bottle which is ang kinahanglan nato na value.
  Serial.print(22-distance);
  Serial.print(",");
  
  if(waterLevel_1_value >500){
    currentWaterLevel_1 = waterLevelValue_High;
    Serial.print("2,");
  }else if(waterLevel_1_value > 320){
    currentWaterLevel_1 = waterLevelValue_Medium;
    Serial.print("1,");
    digitalWrite(valve1, LOW);
  }else{
    currentWaterLevel_1 = waterLevelValue_Low;
    Serial.print("0,");
    digitalWrite(valve1, HIGH);
  }

  if(waterLevel_2_value >420){
    currentWaterLevel_2 = waterLevelValue_High;
    Serial.print("2,");
  }else if(waterLevel_2_value > 320){
    currentWaterLevel_2 = waterLevelValue_Medium;
    Serial.print("1,");
    digitalWrite(valve2, HIGH);
  }else{
    currentWaterLevel_2 = waterLevelValue_Low;
    Serial.print("0,");
    digitalWrite(valve2, LOW);
  }

  if(waterLevel_3_value >330){
    currentWaterLevel_3 = waterLevelValue_High;
    Serial.print("2");
  }else if(waterLevel_3_value > 320){
    currentWaterLevel_3 = waterLevelValue_Medium;
    Serial.print("1");
    digitalWrite(valve3, HIGH);
  }else{
    Serial.print("0");
    currentWaterLevel_3 = waterLevelValue_Low;
    digitalWrite(valve3, LOW);
  }

  if(distance>=18 && !isPumpOn){
    digitalWrite(waterPump, LOW);  
    isPumpOn=true;      
  }else if(distance<=5 && isPumpOn){
    digitalWrite(waterPump, HIGH);
    isPumpOn=false;  
  }

//--------------------------------------------------------------------------------------------------
  /*
  if(currentWaterLevel_1 == waterLevelValue_Hi4gh || currentWaterLevel_2 == waterLevelValue_High){
    
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
  */
  if(currentWaterLevel_1 == waterLevelValue_Low || currentWaterLevel_2 == waterLevelValue_Low){
    for(int i=0;i<3;i++){
      tone(buzzer, 1000);
      delay(300);
      noTone(buzzer);
      delay(200);
    }
  }
//--------------------------------------------------------------------------------------------------  

  /**
  if(soilMoistureState_1 == HIGH || soilMoistureState_2 == HIGH || soilMoistureState_3 == HIGH){
    if(soilMoistureState_1 == HIGH){
      //Serial.println("Soil 1 is dry!");
      lcd.setCursor(0, 0);
      lcd.print("[DRY]");
    }
    if(soilMoistureState_2 == HIGH){
      //Serial.println("Soil 2 is dry!");
      lcd.setCursor(5, 0);
      lcd.print("[DRY]      ");
    }
    if(soilMoistureState_3 == HIGH){
      //Serial.println("Soil 3 is dry!");
      lcd.setCursor(10, 0);
      lcd.print("[DRY]");
    }
    */
    /*
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
  */
  if(currentWaterLevel_1 == waterLevelValue_High || currentWaterLevel_2 == waterLevelValue_High || currentWaterLevel_3 == waterLevelValue_High){
    if(currentWaterLevel_1 == waterLevelValue_High){
      //Serial.println("Soil 1 is dry!");
      lcd.setCursor(0, 0);
      lcd.print("[MAX]");
    }
    if(currentWaterLevel_2 == waterLevelValue_High){
      //Serial.println("Soil 2 is dry!");
      lcd.setCursor(5, 0);
      lcd.print("[MAX]");
    }
    if(currentWaterLevel_3 == waterLevelValue_High){
      //Serial.println("Soil 3 is dry!");
      lcd.setCursor(10, 0);
      lcd.print("[MAX] ");
    
    }
  }
  if(currentWaterLevel_1 == waterLevelValue_Medium || currentWaterLevel_2 == waterLevelValue_Medium || currentWaterLevel_3 == waterLevelValue_Medium){
    if(currentWaterLevel_1 == waterLevelValue_Medium){
      //Serial.println("Soil 1 is dry!");
      lcd.setCursor(0, 0);
      lcd.print("[OK] ");
    }
    if(currentWaterLevel_2 == waterLevelValue_Medium){
      //Serial.println("Soil 2 is dry!");
      lcd.setCursor(5, 0);
      lcd.print("[OK] ");
    }
    if(currentWaterLevel_3 == waterLevelValue_Medium){
      //Serial.println("Soil 3 is dry!");
      lcd.setCursor(10, 0);
      lcd.print("[OK]  ");
    
    }
  }
  if(currentWaterLevel_1 == waterLevelValue_Low || currentWaterLevel_2 == waterLevelValue_Low || currentWaterLevel_3 == waterLevelValue_Low){
    if(currentWaterLevel_1 == waterLevelValue_Low){
      //Serial.println("Soil 1 is dry!");
      lcd.setCursor(0, 0);
      lcd.print("[LOW]");
    }
    if(currentWaterLevel_2 == waterLevelValue_Low){
      //Serial.println("Soil 2 is dry!");
      lcd.setCursor(5, 0);
      lcd.print("[LOW]");
    }
    if(currentWaterLevel_3 == waterLevelValue_Low){
      //Serial.println("Soil 3 is dry!");
      lcd.setCursor(10, 0);
      lcd.print("[LOW] ");
    
    }
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
      if(distance>=18){
        //Serial.println("Reservoir: Low");
        lcd.setCursor(0, 1);
        lcd.print("Reservoir: LOW  ");
        for(int i=0;i<4;i++){
          digitalWrite(ledLight_1, HIGH);
          delay(400);
          digitalWrite(ledLight_1, LOW);
          delay(100);
        }  
      }else if(distance<=6){
        //Serial.println("Reservoir: full");
        lcd.setCursor(0, 1);
        lcd.print("Reservoir: FULL ");
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
  Serial.println();

  delay(500); 
}