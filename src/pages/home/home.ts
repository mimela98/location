import { Component } from '@angular/core';
import { NavController,AlertController,LoadingController  } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items:any[] = [];
  lat;
  lng;
  loading;
  constructor(public navCtrl: NavController, private geolocation: Geolocation, private alertCtrl:AlertController, 
    private nativeGeocoder:NativeGeocoder, public storage:Storage ,public loadingCtrl: LoadingController) {
    this.loadData();
  }
  showLoading()
  {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }
  loadData()
  {
    this.storage.get("location").then((val)=> {
      if(val != null) {
        this.items = val;
      } 
    });
  }
  itemSelected(item)
  {
    alert(item);
  }
  saveLocation(title)
  {
    var obj = { id: (new Date()).getTime(), title : title, lat : this.lat, lng : this.lng };
    this.items.push(obj);
    this.storage.set("location", this.items);
  }
  goLocation(item)
  {
    
    window.open('geo:0,0?z=3&q=' + item.lat + ',' + item.lng + '(' + item.title + ')' , '_system');
  }
  delLocation(idx)
  {
    this.items.splice(idx, 1);
    this.storage.set("location", this.items);
  }
  addLocation()
  {
    this.showLoading();
    this.geolocation.getCurrentPosition({enableHighAccuracy:true}).then((resp) => {

        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
        var defaultTitle = "1";
        this.nativeGeocoder.reverseGeocode(this.lat, this.lng)
        .then((result: NativeGeocoderReverseResult) => {
            defaultTitle = result.thoroughfare + " " + result.subThoroughfare;
            this.popupInputName(defaultTitle); 
            this.loading.dismiss();
          }
        )
        .catch((error: any) => {  this.loading.dismiss(); alert(error);})
        ;
        
      
     }).catch((error) => {
      this.loading.dismiss();
       alert('Error getting location' + error);
       
     });
  }
  popupInputName(defaultTitle)
  {
    
    let prompt = this.alertCtrl.create({
      title: '위치저장',
      message: "저장할 이름을 입력하세요.",
      inputs: [
        {
          name: 'title',
          placeholder: '이름',
          value : defaultTitle
        },
      ],
      buttons: [
        {
          text: '취소',
          handler: data => {
            
          }
        },
        {
          text: '저장',
          handler: data => {
            this.saveLocation(data.title);
          }
        }
      ]
    });
    prompt.present();
  }
}
