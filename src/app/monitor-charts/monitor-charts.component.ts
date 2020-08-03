import { Component, OnInit } from '@angular/core';
import * as CanvasJs from '../canvasjs-2.3.2/canvasjs.min';
import { HttpClient, HttpHeaders } from "@angular/common/http";

interface eventsDay {
  // x: number;
  y: number;
}



@Component({
  selector: 'app-monitor-charts',
  templateUrl: './monitor-charts.component.html',
  styleUrls: ['./monitor-charts.component.less']
})
export class MonitorChartsComponent implements OnInit {

  private readonly httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private readonly aggEventsDay = "http://localhost:7071/api/agg-event-day"

  public EventsDayCount:  eventsDay[] = [];

  constructor(private readonly http: HttpClient) {
    // this.http.post<JSON>(this.aggEventsDay, this.httpOptions).subscribe(eventsDaysArray => {
    //   console.log(eventsDaysArray)
    //   for (let key in eventsDaysArray){
    //     this.EventsDayCount.push({y: eventsDaysArray[key]["y"]})
    //   }
    //   console.log(this.EventsDayCount)
      // this.lonlatArr = lonlat["0"]["address"];
      //  this.CreateHistoryAlerts(lonlat["0"])
      // console.log(this.lonlatArr);
      // console.log(this.mapLonLatArr);

    // });

   }

  ngOnInit(): void {
    this.Charts()
  }
  
  Charts(){
    let chart_col = new CanvasJs.Chart("chartContainerCol", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Basic Column Chart in Angular"
      },
      data: [{
        type: "column",
        dataPoints: [
          { y: 71, label: "Apple" },
          { y: 55, label: "Mango" },
          { y: 50, label: "Orange" },
          { y: 65, label: "Banana" },
          { y: 95, label: "Pineapple" },
          { y: 68, label: "Pears" },
          { y: 28, label: "Grapes" },
          { y: 34, label: "Lychee" },
          { y: 14, label: "Jackfruit" }
        ]
      }]
    });

    let chart_cake = new CanvasJs.Chart("chartContainerCake", {
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      title:{
        text: "Monthly Expense"
      },
      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "<b>{name}</b>: ${y} (#percent%)",
        indexLabel: "{name} - #percent%",
        dataPoints: [
          { y: 450, name: "Food" },
          { y: 120, name: "Insurance" },
          { y: 300, name: "Traveling" },
          { y: 800, name: "Housing" },
          { y: 150, name: "Education" },
          { y: 150, name: "Shopping"},
          { y: 250, name: "Others" }
        ]
      }]
    });
      
    let dataPoints = [];
    let y = 0;		
    for ( var i = 0; i < 10000; i++ ) {		  
      y += Math.round(5 + Math.random() * (-5 - 5));	
      dataPoints.push({ y: y});
    }
    let chart_plot = new CanvasJs.Chart("chartContainerPlot", {
      exportEnabled: true,
		  title:{
			  text:"Live Chart with Data-Points from External JSON"
		  },
		  data: [{
			  type: "spline",
			  dataPoints : this.EventsDayCount,
		  }]
	  });
	
    this.http.post<JSON>(this.aggEventsDay, this.httpOptions).subscribe(eventsDaysArray => {
      console.log(eventsDaysArray)
      for (let key in eventsDaysArray){
        this.EventsDayCount.push({y: eventsDaysArray[key]["y"]})
        // ,x:  +(eventsDaysArray[key]["x"].substring(5,7).concat(eventsDaysArray[key]["x"].substring(8,10)))})
      }
      console.log(this.EventsDayCount)
      chart_plot.render();
    });
    chart_col.render(); 
    chart_cake.render();
  }

}
