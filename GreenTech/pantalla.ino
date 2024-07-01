#include <LiquidCrystal.h>
#include <DHT.h>

LiquidCrystal lcd(11,10,9,8,7,6);

#define DHTTYPE DHT11
#define DHTPIN 5

DHT dht(DHTPIN, DHTTYPE);

const int SensorHumedadSuelo = A0;
const int bomba_agua = 4;
const int ventiladores = 12;
int humedad_suelo;
int valorSensor = 0;


void setup() {
lcd.begin(16,2);
Serial.begin(9600);

pinMode(bomba_agua, OUTPUT);
pinMode(ventiladores, OUTPUT);
}

void loop() {

delay(2000);

int tempC = dht.readTemperature();
int humedad = dht.readHumidity();

if(isnan(humedad) || isnan(tempC)){
    Serial.println("ERROR EN EL SENSOR");
    return;
  }

valorSensor = analogRead (SensorHumedadSuelo);

int humedad_suelo = map(valorSensor, 0, 1023, 100, 0);
humedad = humedad / 10;

Serial.print("Humedad Del Suelo: ");
Serial.print(humedad_suelo);
Serial.print(" Humedad Del Ambiente: ");
Serial.print(humedad);
Serial.print(" Temperatura: ");
Serial.print(tempC);

lcd.setCursor(0,0);
lcd.println("Tem:");
lcd.println("Hum_A:");
lcd.println("Hum:");
lcd.setCursor(0,1);
lcd.print(tempC);
lcd.println("C");
lcd.print(humedad);
lcd.println("%");
lcd.print(humedad_suelo);
lcd.println("%");

if(humedad_suelo < 50){
  digitalWrite(bomba_agua, LOW);
}else{
  digitalWrite(bomba_agua, HIGH);
}

if(tempC > 12){
  digitalWrite(ventiladores, LOW);
}else{
  digitalWrite(ventiladores, HIGH);
}

}
