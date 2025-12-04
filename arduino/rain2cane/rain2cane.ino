#include <Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <SoftwareSerial.h>

#define IR_PIN 9

#define MAIN_SERVO_PIN 8
Servo mainServo;

#define FLOOR_SERVO_PIN_1 12
Servo floorServo1;

#define FLOOR_SERVO_PIN_2 6
Servo floorServo2;

#define LED_PIN A3

#define BUZZER_PIN 4

#define TRIG_PIN 7

#define HAZARDOUS_ECHO_PIN 11
#define BIODEGRADABLE_ECHO_PIN 10
#define NONBIODEGRADABLE_ECHO_PIN 5

#define LED_LIGHT_PIN 13

#define DEFAULT_ANGLE 60


char STATE_IDLE = 'a',
     STATE_IDENTIFYING = 'b',
     STATE_DUMPING = 'c',
     STATE_ERROR = 'e';

char currentState = STATE_IDLE;

char TYPE_BIODEGRADABLE = 'b',
     TYPE_NONBIODEGRADABLE = 'n',
     TYPE_HAZARDOUS = 'h',
     TYPE_NULL='0',
     TYPE_ERROR='`';

char garbageType;

boolean isBiodegradableFull,
        isNonBiodegradableFull,
        isHazardousFull;
int biodegradableFullCounter,
    nonBiodegradableFullCounter,
    hazardousFullCounter;
long dist;

int biodegradableFullCount,
    nonBiodegradableFullCount,
    hazardousFullCount;

bool sentBiodegradableNotif,
     sentNonBiodegradableNotif,
     sentHazardousNotif;

bool sentBiodegradableReset,
     sentNonBiodegradableReset,
     sentHazardousReset;

LiquidCrystal_I2C lcd(0x27, 16, 2);

boolean isInitializing;
char inputString[100];
byte index;

int currentAngle=DEFAULT_ANGLE,
    targetAngle=DEFAULT_ANGLE;
int multiplier=1;

//---------------------------------- function to read the distance using HC-SR04 sensor --------------------------------------
long readDistance(int echoPin) {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2;
  return distance;
}

long readDistance(int echoPin, int trigPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2;
  return distance;
}


//--------------------------------- function to check the status of each bin -------------------------------------------------
void checkBins(){
  dist = readDistance(BIODEGRADABLE_ECHO_PIN);
  /*
  Serial.print("biodegradable distance: ");
  Serial.print(dist);
  Serial.println(" cm");//*/
  if(dist<=10){
    if(biodegradableFullCounter<4){
      biodegradableFullCounter++;
    }
  }else{
    if(biodegradableFullCounter>0){
      biodegradableFullCounter--;
    }else{
      if(sentBiodegradableNotif&&!sentBiodegradableReset){
        Serial.print("iR");
        Serial.println(TYPE_BIODEGRADABLE);
        sentBiodegradableNotif=false;
        sentBiodegradableReset=true;
      }
    }
  }
  
  if(biodegradableFullCounter > 2){
    isBiodegradableFull=true;
  }else{
    isBiodegradableFull=false;
  }
  delay(100);
  dist = readDistance(NONBIODEGRADABLE_ECHO_PIN);
  /*
  Serial.print("non-biodegradable distance: ");
  Serial.print(dist);
  Serial.println(" cm");*/
  if(dist<=10){
    if(nonBiodegradableFullCounter<4){
      nonBiodegradableFullCounter++;
    }
  }else{
    if(nonBiodegradableFullCounter>0){
      nonBiodegradableFullCounter--;
    }else{
      if(sentNonBiodegradableNotif&&!sentNonBiodegradableReset){
        Serial.print("iR");
        Serial.println(TYPE_NONBIODEGRADABLE);
        sentNonBiodegradableNotif=false;
        sentNonBiodegradableReset=true;
      }
    }
  }
  
  if(nonBiodegradableFullCounter > 2){
    isNonBiodegradableFull=true;
  }else{
    isNonBiodegradableFull=false;
  }
  delay(100);
  dist = readDistance(HAZARDOUS_ECHO_PIN);
  /*
  Serial.print("hazardous distance: ");
  Serial.print(dist);
  Serial.println(" cm");//*/
  if(dist<=10){
    if(hazardousFullCounter<4){
      hazardousFullCounter++;
    }
  }else{
    if(hazardousFullCounter>0){
      hazardousFullCounter--;
    }else{
      if(sentHazardousNotif&&!sentHazardousReset){
        Serial.print("iR");
        Serial.println(TYPE_HAZARDOUS);
        sentHazardousNotif=false;
        sentHazardousReset=true;
      }
    }
  }
  delay(100);
  
  if(hazardousFullCounter > 2){
    isHazardousFull=true;
  }else{
    isHazardousFull=false;

  }

  lcd.setCursor(0, 1);
  lcd.print("                ");
  lcd.setCursor(0, 1);
  if(!isNonBiodegradableFull && !isBiodegradableFull && !isHazardousFull){
    lcd.print("All Bins are OK!");
  }else{
    lcd.print("!");
    if(isBiodegradableFull){
      lcd.print("Bio,");
      if(!sentBiodegradableNotif){
        Serial.print("iF");
        Serial.println(TYPE_BIODEGRADABLE);
        sentBiodegradableNotif=true;
        sentBiodegradableReset=false;
      }
    }
    if(isNonBiodegradableFull){
      lcd.print("NonBio,");
      if(!sentNonBiodegradableNotif){
        Serial.print("iF");
        Serial.println(TYPE_NONBIODEGRADABLE);
        sentNonBiodegradableNotif=true;
        sentNonBiodegradableReset=false;
      }
    }
    if(isHazardousFull){
      lcd.print("Hzrd");
      if(!sentHazardousNotif){
        Serial.print("iF");
        Serial.println(TYPE_HAZARDOUS);
        sentHazardousNotif=true;
        sentHazardousReset=false;
      }
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------
void processMessage(){
  while(Serial.available() > 0){
    char letter = Serial.read();

    if(letter == '\n'){
      inputString[index] = '\0';
      if(inputString[0] == 'g' && inputString[1] == 'o' && isInitializing){
        isInitializing=false;
        Serial.println("GO");
        moveMainServo(2);
        delay(3000);
        tone(BUZZER_PIN, 1000);
        delay(200);
        noTone(BUZZER_PIN);
        delay(200);
        tone(BUZZER_PIN, 1000);
        delay(200);
        noTone(BUZZER_PIN);
      }else{
        if(currentState == STATE_IDENTIFYING){
          if(inputString[0] == 'o'){
            if(inputString[1] == TYPE_BIODEGRADABLE){
              garbageType = TYPE_BIODEGRADABLE;
            }else if(inputString[1] == TYPE_NONBIODEGRADABLE){
              garbageType = TYPE_NONBIODEGRADABLE;
            }else if(inputString[1] == TYPE_HAZARDOUS){
              garbageType = TYPE_HAZARDOUS;
            }else{
              garbageType=TYPE_ERROR;
            }
          }
        }else{
          Serial.println(inputString);
        }
      }
      index=0;
    }else{
      if(index < sizeof(inputString) -1){
        inputString[index++] = letter;
      }
    }
  }
}

//---------------------------------- function to move the main servo ---------------------------------------------------------
void moveMainServo(int quadrant){
  switch(quadrant){
    case 1:{
      targetAngle=0;
    }break;
    case 2:{
      targetAngle=60;
    }break;
    case 3:{
      targetAngle=120;
    }break;
    case 4:{
      targetAngle=180;
    }break;
    default:{
      return;
    }
  }

  if(currentAngle<targetAngle){
    multiplier=1;
  }else if(currentAngle>targetAngle){
    multiplier=-1;
  }else{
    return;
  } 

  

  if(targetAngle==60 && currentAngle==120){
    currentAngle=180;
    mainServo.write(currentAngle);
    delay(500);
  }
    while(currentAngle!=targetAngle){
      currentAngle=currentAngle+(20*multiplier);
      mainServo.write(currentAngle);
      delay(70);
    }
}

//----------------------------------------------------------------------------------------------------------------------------
void dumpError(){
      lcd.setCursor(0, 0);
      lcd.print("Bin is Full!    ");
      
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(1000);
      moveMainServo(3);
}



void setup() {
  Serial.begin(9600);

  mainServo.attach(MAIN_SERVO_PIN);
  floorServo1.attach(FLOOR_SERVO_PIN_1);
  floorServo2.attach(FLOOR_SERVO_PIN_2);

  pinMode(IR_PIN, INPUT);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(HAZARDOUS_ECHO_PIN, INPUT);
  pinMode(BIODEGRADABLE_ECHO_PIN, INPUT);
  pinMode(NONBIODEGRADABLE_ECHO_PIN, INPUT);

  pinMode(LED_LIGHT_PIN, OUTPUT);

  mainServo.write(DEFAULT_ANGLE);
  floorServo1.write(0);
  floorServo2.write(0);

  lcd.init();
  lcd.backlight();
  lcd.print("Initializing...");

  biodegradableFullCounter=0;
  nonBiodegradableFullCounter=0;
  hazardousFullCounter=0;
  dist=0;

  sentBiodegradableNotif=false;
  sentNonBiodegradableNotif=false;
  sentHazardousNotif=false;
  sentBiodegradableReset=true;
  sentNonBiodegradableReset=true;
  sentHazardousReset=true;

  isInitializing=true;
  garbageType=TYPE_NULL;
  index=0;

}


void loop() {
  processMessage();
  if(isInitializing){
    return;
  }

  if(currentState == STATE_IDENTIFYING){
    if(garbageType==TYPE_NULL){
      lcd.setCursor(0, 0);
      lcd.print("Identifying...  ");
    }else if(garbageType==TYPE_ERROR){
      lcd.setCursor(0, 0);
      lcd.print("Network Error!  ");
      
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(200);
      tone(BUZZER_PIN, 1000);
      delay(300);
      noTone(BUZZER_PIN);
      delay(1000);

      moveMainServo(3);
      delay(1000);
      floorServo1.write(90);
      floorServo2.write(90);
      delay(1000);
      floorServo1.write(0);
      floorServo2.write(0);
      delay(1000);

      moveMainServo(2);
      currentState=STATE_IDLE;
      delay(1000);
    }else{
      Serial.println(garbageType);
      digitalWrite(LED_LIGHT_PIN, LOW);
      currentState=STATE_DUMPING;
    }

  }else if(currentState == STATE_DUMPING){
      lcd.setCursor(0, 0);
      moveMainServo(4);
      if(garbageType == TYPE_BIODEGRADABLE){
        if(isBiodegradableFull){
          dumpError();
        }else{
          lcd.print("Biodegradable   ");
          tone(BUZZER_PIN, 1000);
          delay(600);
          noTone(BUZZER_PIN);
          delay(1000);
          moveMainServo(1);
          Serial.print("tS");
          Serial.println(garbageType);
        }
      }else if(garbageType == TYPE_NONBIODEGRADABLE){
        if(isNonBiodegradableFull){
          dumpError();
        }else{
          lcd.print("NonBiodegradable");
          tone(BUZZER_PIN, 1000);
          delay(300);
          noTone(BUZZER_PIN);
          delay(100);
          tone(BUZZER_PIN, 1000);
          delay(300);
          noTone(BUZZER_PIN);
          delay(1000);
          moveMainServo(2);
          Serial.print("tS");
          Serial.println(garbageType);
        }
      }else{
        if(isHazardousFull){
          dumpError();
        }else{
          lcd.print("Hazardous       ");
          tone(BUZZER_PIN, 1000);
          delay(250);
          noTone(BUZZER_PIN);
          delay(100);
          tone(BUZZER_PIN, 1000);
          delay(250);
          noTone(BUZZER_PIN);
          delay(100);
          tone(BUZZER_PIN, 1000);
          delay(250);
          noTone(BUZZER_PIN);
          delay(1000);
          moveMainServo(4);
          Serial.print("tS");
          Serial.println(garbageType);
        }
      }

    delay(1000);
    floorServo1.write(90);
    floorServo2.write(90);
    delay(1000);
    floorServo1.write(0);
    floorServo2.write(0);
    delay(1000);
    moveMainServo(2);
    currentState=STATE_IDLE;
    delay(1000);
  }else if(currentState == STATE_ERROR){

    

  }else{
    lcd.setCursor(0, 0);
    lcd.print("Ready           ");

    if(currentState == STATE_IDLE){
      int sensedHand = digitalRead(IR_PIN);
      if(sensedHand == LOW){
        tone(BUZZER_PIN, 1000);
        delay(100);
        noTone(BUZZER_PIN);
        delay(1000);
        garbageType = TYPE_NULL;
        digitalWrite(LED_LIGHT_PIN, HIGH);
        mainServo.write(155);
        delay(1000);
        Serial.println("tR");
        currentState = STATE_IDENTIFYING;
      }
    }
  }
  
  checkBins();
  delay(1000);
}