import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()

let baseUrl="http://10.135.10.81:8080/emos-wx-api"
Vue.prototype.url={
	register:baseUrl+"/user/register",
	login:baseUrl+"/user/login",
	checkin: baseUrl+"/checkin/checkin",
	createFaceModel: baseUrl+"/checkin/createFaceModel",
	validCanCheckIn: baseUrl+"/checkin/validCanCheckIn"
}

Vue.prototype.ajax=function(url,method,data,fun){
	uni.request({
		"url":url,
		"method":method,
		"header":{
			token:uni.getStorageInfoSync("token")
		},
		"data":data,
		success:function(resp){
			console.log(resp)
			if(resp.statusCode==401){
				uni.redirectTo({
					url:"/pages/login/login.vue"
				})
			}else if(resp.statusCode==200&&resp.data.code==200){
				let data = resp.data
				if(data.hasOwnProperty("token")){
					let token = data.token
					console.log(token)
					uni.setStorageSync("token",token)
				}
				fun(resp)
			}else{
				uni.showToast({
					icon:'none',
					title:resp.data
				})
			}
		}
	})
}


