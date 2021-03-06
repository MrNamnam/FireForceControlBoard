/// <reference types="@types/googlemaps" />
import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";
import {MatSelectionList, MatListOption} from '@angular/material/list';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import { range } from 'rxjs';
import { stringify } from 'querystring';

import { OnInit } from '@angular/core'

import { AfterViewInit, ElementRef } from '@angular/core';
import { } from 'googlemaps';
import { AgmCoreModule } from '@agm/core';


interface SomkingDetector {
  id: number
  latitude: number
  longitude: number
  address: string
  owner_name: string
  owner_phone_num: number 
}

interface Events {
  Timestamp: Date
  device_id: number
  event_id: number
  is_false_alarm: boolean
  event_details: string
  num_of_injured: number
}

interface SignalRConnection {
  url: string;
  accessToken: string;
}

interface Counter {
  id: number;
  count: number;
}


interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Mike',
    children: [
      {name: 'home device'},
      {name: 'shop device'},
      {name: 'garage device'},
    ]
  }, {
    name: 'Charly',
    children: [
      {name: 'home device'},
      {name: 'garage device'},
    ]
  }, {
        name: 'Anne',
        children: [
          {name: 'home device'},
        ]
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface CurrentAlertsObject {
  PartitionKey: string;
  RowKey: string;
  latitude: string;
  longitude: string;
}

interface ClientsObject {
  PartitionKey: string;
  RowKey: string;
  email: string;
  name: string;
  password: string;
  phone_number: string;
}


interface AlertNode {
  alert_obj: CurrentAlertsObject;
  client_obj: ClientsObject;
}






@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  encapsulation: ViewEncapsulation.None,

})





export class AppComponent{

  ////////// for map
  public dis: String ;
  public time: number ;
  public h: String ;
  public m: String ;
  public lat: Number = 32.2936086;
  public lng: Number = 34.9367102;
  public origin: any;
  public destination: any;
  getDirection() {
    this.origin = { lat: 32.0483568, lng: 34.7537548 };//default is jaffa
    if (this.buttonid != '-1') {
      if (this.station == 'Eilat') {
        this.origin = { lat: 29.5661306, lng: 34.948351 };
      }
      else if (this.station == 'Jaffa') {
        this.origin = { lat: 32.0483568, lng: 34.7537548 };
      }
      else if (this.station == 'Haifa') {
        this.origin = { lat: 32.801523, lng: 34.983553 };
      }
      else if (this.station == 'Jerusalem') {
        this.origin = { lat: 31.762427, lng: 35.199502 };
      }
      else if (this.station == "Beer Sheva") {
        this.origin = { lat: 31.263284, lng: 34.820021 };
      }
    }
    console.log(this.ALERTS_DATA[this.buttonid].alert_obj.latitude);
    var lat1: number = +this.ALERTS_DATA[this.buttonid].alert_obj.latitude;
    var lon1: number = +this.ALERTS_DATA[this.buttonid].alert_obj.longitude;
    this.destination = { lat: lat1, lng: lon1  };
    
    var _kCord = new google.maps.LatLng(this.origin.lat, this.origin.lng);
    var _pCord = new google.maps.LatLng(this.destination.lat, this.destination.lng);
    this.dis = google.maps.geometry.spherical.computeDistanceBetween(_kCord, _pCord).toFixed(3);
    this.time = (google.maps.geometry.spherical.computeDistanceBetween(_kCord, _pCord) / 70000);
    this.h = this.time.toFixed(3);
    this.m = ((this.time)*60).toFixed(3);
    console.log(this.dis);
    console.log(this.h);
    console.log(this.m);
  }



  ////////// for map
  panelOpenState = false;
  checked = false;

  private readonly connectionStringStorage = "?sv=2019-12-12&ss=bfqt&srt=sco&sp=rwdlacupx&se=2020-09-16T20:26:30Z&st=2020-08-06T12:26:30Z&spr=https,http&sig=NO59mo1wI95CNGVWrXozkF7Nt7Dp%2BVfMPvDqL%2BYL0%2FQ%3D"

  private readonly httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private readonly negotiateUrl = "http://localhost:7071/api/negotiate";
  private readonly getCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/get-counter";
  private readonly updateCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/update-counter";
  private readonly getIotDevicesUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/devices";
  private readonly pushButtonUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/pushButton";
  private readonly getActiveEvents = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/CurrentAlerts" + this.connectionStringStorage;
  private readonly getClientData = "http://localhost:7071/api/match-alert-to-client/"
  private readonly addEvent = "http://localhost:7071/api/add-event"
  private readonly deleteCurrent = "http://localhost:7071/api/delete-alert"
  //?$filter=RowKey%20eq%20"

  // lina:
  private readonly getHistoryEvents = "http://localhost:7071/api/ListEvents"

  //private readonly connectionStringStorage = "?sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-08-08T06:17:45Z&st=2020-06-02T22:17:45Z&spr=https&sig=ez4xdZR94dP9%2FB8Czup%2FRXLYaa%2BfWilA%2BOfi9rgCZqU%3D"
  private readonly counterId = 1;

  private hubConnection: signalR.HubConnection;
  public counter: number = 0;
  public devices: string[] = ["bla", "bla1"];
  public events: JSON;
  public page: string;
  public buttonid: string = '-1';
  public station: string = '-1';

  // lina:
  public displayedColumns: string[] = ['id', 'city', 'country', 'lat', 'lon','details','bool','number'];
  public dataSource: object[] = [];
 
  public ALERTS_DATA:  AlertNode[] = [];
  public errorSubmit: string;
  public details: string = null
  public injured: number = null;
  public url: string;





  constructor(private readonly http: HttpClient) {
    const negotiateBody = { UserId: "FireWeb" };
   
    this.http
      .post<SignalRConnection>(this.negotiateUrl, JSON.stringify(negotiateBody), this.httpOptions)
      .pipe(
        map(connectionDetails =>
          new signalR.HubConnectionBuilder().withUrl(`${connectionDetails.url}`, { accessTokenFactory: () => connectionDetails.accessToken }).build(),
        )
      )
      .subscribe(hub => {
        this.hubConnection = hub;
        hub.on("NewAlert", data => {
          console.log(data)
          let alert : ClientsObject = data
          this.SignalrUpdatingNewCurrentAlert(alert);
        });
        hub.start();
      });







   this.GetCurrentAlerts()




    this.http.get<JSON>(this.getHistoryEvents, this.httpOptions).subscribe(History => {
      console.log(history)
      this.CreateHistoryAlerts(History)
      console.log(this.dataSource)

    });



          
  }
  
  public GetCurrentAlerts(): void{
    this.http.get<JSON>(this.getActiveEvents, this.httpOptions).subscribe(Alerts => {  
      console.log(Alerts)
      for (let key in Alerts["value"]) {
        let rowkey =  Alerts["value"][key].PartitionKey // partionkey of alerts is the email  
        console.log(rowkey);
        this.http.get<JSON>(this.getClientData + rowkey, this.httpOptions).subscribe(clientsData => {
          console.log(clientsData);
          if(clientsData != null){
            this.CreateAlerts(Alerts["value"][key], clientsData);
          }


        });
      }
      console.log(this.ALERTS_DATA)
    }); 
  }

  public CreateAlerts(alertElement, clientElement): void {
    console.log(alertElement)
    console.log(clientElement)
    this.ALERTS_DATA.push({ alert_obj: alertElement, client_obj: clientElement })
  }

  public SignalrUpdatingNewCurrentAlert(alert){
    for (let key in this.ALERTS_DATA){
      if((this.ALERTS_DATA[key]["alert_obj"].PartitionKey = alert["PartitionKey"]) & (this.ALERTS_DATA[key]["alert_obj"].RowKey = alert["RowKey"])){
        this.ALERTS_DATA[key]["alert_obj"] = alert
        return 
      }
    }
    this.http.get<JSON>(this.getClientData + alert.PartitionKey, this.httpOptions).subscribe(clientsData => {
      console.log(clientsData);
      if(clientsData != null){
        this.CreateAlerts(alert, clientsData);
      }
  }); 
}


  public CreateHistoryAlerts(event): void{
    console.log(event)
    this.dataSource.push(event)
  }
  

  public changeToPage(pageName: string): void {
    this.page = pageName
    console.log(this.buttonid)

  }


  public showButton(i: string): void {
    this.buttonid = i
    console.log(this.buttonid)
  }
  
  public showStation(i: string): void {
    this.station = i
  }

  onChange(event) {
    this.station = event;
  }

  changeDisabled(): boolean{
    console.log(this.checked)
    this.checked = !this.checked;
    if(this.checked){
      this.details = null
      this.injured = null
    }
    console.log(this.checked)
    return this.checked;
  }


  submitEvent(RowKey: string, PartitionKey: string, latitude: string, longitude: string, time: string,
    is_false_alarm: boolean, event_details: string, num_of_injured: number): void{
      console.log(PartitionKey + "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11")
      let is_false_alarm_str = is_false_alarm.toString();
      if(!this.checked){
        this.url =  "/" + PartitionKey + "/" + "country" + "/" + "city" + "/"
        + "email" + "/" +latitude + "/" + longitude + "/" + time + "/" + 
        is_false_alarm_str + "/" + "null" + "/" + "null";
      }
      else{
              this.url =  "/" + RowKey + "/" + PartitionKey + "/" + latitude +
      "/" + longitude + "/" + time + "/" + is_false_alarm_str + "/" + event_details + "/" 
      + num_of_injured + "/" + "adress";
      }


      console.log(this.url)

      this.http.post(this.addEvent + this.url, this.httpOptions).toPromise()
      .catch(e =>
        this.errorSubmit = stringify(e));

      this.http.get<JSON>(this.deleteCurrent + "/" + RowKey + "/" + PartitionKey
      , this.httpOptions) .subscribe(() => {
          console.log("delete alert");});

     this.GetCurrentAlerts()

    }
    




      


}







