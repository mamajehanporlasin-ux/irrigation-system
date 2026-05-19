/*
  There is an error always during uploading of the code, dont forget to poweroff the entire system before uploading the code. It is due to the stepper motor board
  controller. You can try disconnecting the pins first of the controller board before uploading. Or mas easier ng i.turn off sa lamang connect ra ng arduino pag
  upload.
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>
#include <DHT.h>
#include <Stepper.h>
#include <Servo.h>
#include <SerialMP3Player.h>

#define DHTPIN 2
#define DHTTYPE DHT22
#define soilMoisture1 7
#define soilMoisture2 6
#define soilMoisture3 8
#define soilMoisture4 5
#define waterPump1 48
#define waterPump2 49

#define waterPump4 51
#define waterPump5 52

#define siren 50
/*
#define field1SoilMoistureLed 10
#define field2SoilMoistureLed 11
#define field1WaterLvlLed 12
#define field2WaterLvlLed 13
*/
#define BUZZER 22
#define scarecrowBase 24
#define scarecrosHandPin1 25
#define scarecrosHandPin2 26
#define trig 4
#define echo 3
#define IN1 10
#define IN2 11
#define IN3 12
#define IN4 13

#define field1WaterLevelLow 35
#define field1WaterLevelHigh 34

#define field2WaterLevelLow 37
#define field2WaterLevelHigh 36

#define rainSensor 46

const int stepsPerRevolution = 2048, stepLimit=2048*1.5;

int baseCurrentPosition, baseMovementValue, baseAngle, baseRotationDirection;
int handsCurrentPosition, handsMovementValue, handAngle1, handAngle2, handsRotationDirection;

Servo scareCrowBase, scarecrowHand1, scarecrowHand2;
Stepper myStepper(stepsPerRevolution, IN1, IN3, IN2, IN4);
DHT dht(DHTPIN, DHTTYPE);

unsigned long currentTime, previousDHTUpdate, previousDataStreamUpdate, previousWaterPump1Update, scareCrowRoutineElapsedTime;
int soilReading1, soilReading2, soilReading3, soilReading4, soilReading5, soilReading6;

float field1WaterReading, field2WaterReading;
float humidity, temperature;

bool isField2Moist, isField1Moist, isPump1On, isPump2On, isPump3On, isPump4On, isPump5On, isPump6On;
int field1WaterLevelValue, field2WaterLevelValue;

long duration;
float distance;

int isRaining;

int pump1Offcount=0, pump2Offcount=0, pump3Offcount=0, pump4Offcount=0, pump5Offcount=0, pump6Offcount=0; 

bool ON;

float readDistance() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);

  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  duration = pulseIn(echo, HIGH);
  distance = duration * 0.034 / 2;

  return distance;
}

void performScarecrowRoutine(){
  baseCurrentPosition=stepLimit;
  baseAngle=0;
  scareCrowBase.write(baseAngle);
  handAngle1=0;
  scarecrowHand1.write(handAngle1);
  handAngle2=180;
  scarecrowHand2.write(handAngle2);

  digitalWrite(siren, LOW);
  while(baseCurrentPosition>0){

  baseCurrentPosition=baseCurrentPosition-15;

    if(baseCurrentPosition>15){
      baseMovementValue=-15;
    }else{
      baseMovementValue=baseCurrentPosition*-1;
      baseCurrentPosition=0;
    }
    myStepper.step(baseMovementValue);
    if(baseRotationDirection>0){
      if(baseAngle<180){
        baseAngle=baseAngle+5;
      }else{
        baseRotationDirection=-1;
      }
    }else{
      if(baseAngle>0){
        baseAngle=baseAngle-5;
      }else{
        baseRotationDirection=1;
      }
    }


    scareCrowBase.write(baseAngle);

    if(handsRotationDirection>0){
      if(handAngle1<180){
        handAngle1=handAngle1+15;
      }else{
        handsRotationDirection=-1;
      }
    }else{
      if(handAngle1>0){
        handAngle1=handAngle1-15;
      }else{
        handsRotationDirection=1;
      }
    }
    handAngle2=180-handAngle1;

    scarecrowHand1.write(handAngle1);
    scarecrowHand2.write(handAngle2);

    delay(10);
  }

  ///*
  baseCurrentPosition=0;
  while(baseCurrentPosition<stepLimit){
    baseCurrentPosition=baseCurrentPosition+15;

    if(baseCurrentPosition<(stepLimit-15)){
      baseMovementValue=15;
    }else{
      baseMovementValue=stepLimit-baseCurrentPosition;
      baseCurrentPosition=4000;
    }

    myStepper.step(baseMovementValue);

    if(baseRotationDirection>0){
      if(baseAngle<180){
        baseAngle=baseAngle+5;
      }else{
        baseRotationDirection=-1;
      }
    }else{
      if(baseAngle>0){
        baseAngle=baseAngle-5;
      }else{
        baseRotationDirection=1;
      }
    }

    scareCrowBase.write(baseAngle);

    if(handsRotationDirection>0){
      if(handAngle1<180){
        handAngle1=handAngle1+15;
      }else{
        handsRotationDirection=-1;
      }
    }else{
      if(handAngle1>0){
        handAngle1=handAngle1-15;
      }else{
        handsRotationDirection=1;
      }
    }
    handAngle2=180-handAngle1;

    scarecrowHand1.write(handAngle1);
    scarecrowHand2.write(handAngle2);

    delay(10);
  }

  handAngle1=90;
  scarecrowHand1.write(handAngle1);
  handAngle2=90;
  scarecrowHand2.write(handAngle2);
  scareCrowBase.write(90);  

  digitalWrite(siren, HIGH);
}

void setup() {
  Serial.begin(9600);
  pinMode(soilMoisture1, INPUT);
  pinMode(soilMoisture2, INPUT);
  pinMode(soilMoisture3, INPUT);
  pinMode(soilMoisture4, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(waterPump1, OUTPUT);
  pinMode(waterPump2, OUTPUT);
  pinMode(siren, OUTPUT);
  pinMode(waterPump4, OUTPUT);
  pinMode(waterPump5, OUTPUT);

  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(rainSensor, INPUT);
  pinMode(field1WaterLevelLow, INPUT_PULLUP);
  pinMode(field1WaterLevelHigh, INPUT_PULLUP);
  pinMode(field2WaterLevelLow, INPUT_PULLUP);
  pinMode(field2WaterLevelHigh, INPUT_PULLUP);

  dht.begin();
  myStepper.setSpeed(10);
  scareCrowBase.attach(scarecrowBase);
  scarecrowHand1.attach(scarecrosHandPin1);
  scarecrowHand2.attach(scarecrosHandPin2);

  currentTime=0;
  previousDHTUpdate=0;
  previousDataStreamUpdate=0;
  previousWaterPump1Update=0;
  soilReading1=0;
  soilReading2=0;

  field1WaterReading=0;
  soilReading4=0;
  soilReading5=0;

  field2WaterReading=0;
  humidity=0;
  temperature=0;


  isField2Moist=false;
  isField1Moist=false;
  field1WaterLevelValue=0;
  field2WaterLevelValue=0;
  baseMovementValue=0;

  isPump1On=false;
  isPump2On=false;
  isPump4On=false;
  isPump5On=false;

  baseCurrentPosition=stepLimit;
  baseAngle=90;
  baseRotationDirection=1;
  handAngle1=90;
  handAngle2=90;
  handsRotationDirection=1;
  distance=0;
  duration=0;
  isRaining=0;

  digitalWrite(waterPump1, HIGH);
  digitalWrite(waterPump2, HIGH);
  digitalWrite(siren, LOW);
  digitalWrite(waterPump4, HIGH);
  digitalWrite(waterPump5, HIGH);
  scareCrowBase.write(baseAngle);
  scarecrowHand1.write(handAngle1);
  scarecrowHand2.write(handAngle2);
  delay(1000);
}

void loop() {
  if(Serial.available()){
    String message = Serial2.readStringUntil('\n');
    if(message.length()>1){
      ON=false;
    }
  }
  currentTime=millis();
  soilReading1=digitalRead(soilMoisture1);
  soilReading2=digitalRead(soilMoisture2);
  
  soilReading4=digitalRead(soilMoisture3);
  soilReading5=digitalRead(soilMoisture4);
  
  delay(100);

  isRaining=digitalRead(rainSensor) == LOW;
  if(soilReading1 == LOW && soilReading2 == LOW){
    isField1Moist=true;
  }else{
    isField1Moist=false;
  }

  if(soilReading4 == LOW && soilReading5 == LOW){
    isField2Moist=true;
  }else{
    isField2Moist=false;
  }


  
  if((digitalRead(field1WaterLevelLow) == LOW)){
    field1WaterLevelValue=1;
    if((digitalRead(field1WaterLevelHigh) == LOW)){
      field1WaterLevelValue=2;
    }
  }else{
    field1WaterLevelValue=0;
  }

  if((digitalRead(field2WaterLevelLow) == LOW)){
    field2WaterLevelValue=1;
    if((digitalRead(field2WaterLevelHigh) == LOW)){
      field2WaterLevelValue=2;
    }
  }else{
    field2WaterLevelValue=0;
  }

  ///*
  if(isRaining<1){
    
    /*
    Serial.print("Moisture1: ");
    Serial.print(soilReading1);
    Serial.print("     Moisture2: ");
    Serial.print(soilReading2);
    Serial.print("     Moisture4: ");
    Serial.print(soilReading4);
    Serial.print("     Moisture5: ");
    Serial.print(soilReading5);
    
    Serial.print("Moisture4: ");
    Serial.print(soilReading4);

    Serial.print("   isPumpOn4: ");
    Serial.print(isPump4On);
    Serial.print("   Moisture5: ");
    Serial.print(soilReading5);
    Serial.print("   isPumpOn5: ");
    Serial.print(isPump5On);
    Serial.println();
    */
    if(soilReading1 == HIGH){
      if(!isPump2On){
        //Serial.println("PUmp1");
        digitalWrite(waterPump1, LOW);
      }
      
      isPump1On=true;
    }
    else if(soilReading2 == HIGH){
      if(!isPump1On){
        //Serial.println("PUmp2");
        digitalWrite(waterPump2, LOW);
      }
     
      isPump2On=true;
    }

    if(soilReading4 == HIGH){
      if(!isPump4On){
        //Serial.println("PUmp4");
        digitalWrite(waterPump4, LOW);
      }
      
      isPump4On=true;
    }
    else if(soilReading5 == HIGH){
      if(!isPump5On){
        //Serial.println("PUmp5");
        digitalWrite(waterPump5, LOW);
      }
      isPump5On=true;
    }
  }//*/

  if(soilReading1 == LOW && isPump1On){
    digitalWrite(waterPump1, HIGH);
    isPump1On=false;
  }

  if(soilReading2 == LOW && isPump2On){
    Serial.println("Check: ");
    digitalWrite(waterPump2, HIGH);
    isPump2On=false;
  }

  if(soilReading4 == LOW && isPump4On){
    digitalWrite(waterPump4, HIGH);
    isPump4On=false;
  }

  if(soilReading5 == LOW && isPump5On){
    digitalWrite(waterPump5, HIGH);
    isPump5On=false;
  }
/*
  if(soilReading2 == LOW && isPump2On){
    digitalWrite(waterPump2, HIGH);
    isPump2On=false;
  }

  if(soilReading4 == LOW && isPump4On){
    digitalWrite(waterPump4, HIGH);
    isPump4On=false;
  }

  if(soilReading5 == LOW && isPump5On){
    digitalWrite(waterPump5, HIGH);
    isPump5On=false;
  }
  */

  if(currentTime-previousDHTUpdate>2000){
    float rawhumidity = dht.readHumidity();
    float rawtemperature = dht.readTemperature();
    previousDHTUpdate=currentTime;
    if(!isnan(rawhumidity) && !isnan(rawtemperature)){
      humidity=rawhumidity;
      temperature=rawtemperature;
    }
  }

  /*
  if(!isField2Moist || !isField1Moist){
    for(int i=0;i<3;i++){
      tone(BUZZER, 1000);
      delay(300);
      noTone(BUZZER);
      delay(200);
    }
  }
  
  
  if(field1WaterLevelValue == 0 || field2WaterLevelValue == 0){
    for(int i=0;i<2;i++){
      tone(BUZZER, 1000);
      delay(400);
      noTone(BUZZER);
      delay(200);
    }
  }
  */

  if(currentTime-previousDataStreamUpdate>1500){
    Serial.print(humidity);
    Serial.print(",");
    Serial.print(temperature);
    Serial.print(",");
    Serial.print(field1WaterLevelValue);
    Serial.print(",");
    Serial.print(field2WaterLevelValue);
    Serial.print(",");
    Serial.print(isRaining);
    Serial.print(",");
    Serial.print(soilReading1);
    Serial.print(",");
    Serial.print(soilReading2);
    Serial.print(",");
    Serial.print(soilReading4);
    Serial.print(",");
    Serial.print(soilReading5);
    Serial.print(",");
    Serial.print(isPump1On);
    Serial.print(",");
    Serial.print(isPump2On);
    Serial.print(",");
    Serial.print(isPump4On);
    Serial.print(",");
    Serial.print(isPump5On);
    Serial.println();

    previousDataStreamUpdate=currentTime;

  }

  if(readDistance()<16){
    performScarecrowRoutine();
  }

  delay(1200);
}