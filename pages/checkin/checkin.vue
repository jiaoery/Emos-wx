<template>
	<view>
		<camera device-position="front" flash="off" class="camera" @error="error" v-if="showCamera"></camera>
		<image mode="widthFix" class="image" :src="photoPath" v-if="showImage"></image>
		<view class="operate-container">
			<button type="primary" class="btn" @tap="clickBtn" :disabled="!canCheckIn">{{btnText}}</button>
			<button type="warn" class="btn" @tap="afresh" :disabled="!canCheckIn">重拍</button>
		</view>
		
		<view class="notice-container">
			<text class="notice">注意事项</text>
			<text class="desc">拍照签到的时候,必须要拍摄到自己的正面照片，侧面照片会导致无法识别。另外，拍照的时候不要佩戴墨镜或者帽子，避免影响拍照签到的准确度。</text>
		</view>
	</view>
</template>

<script>
	var QQMapWX=require('../../lib/qqmap-wx-jssdk.min.js');
	var qqmapsdk;
	export default {
		data() {
			return {
				canCheckIn: true,
				photoPath: '',
				btnText: '拍照',
				showCamera: true,
				showImage: false
			}
		},
		onLoad:function(){
			// 初始化腾讯地图服务sdk
			qqmapsdk = new QQMapWX({key : 'S7UBZ-2D6CU-GUHVA-BASX5-ZHFXS-PCFO4'})
		},
		methods: {
			clickBtn:function(){
				let that = this;
				if(that.btnText == '拍照'){
					let ctx = uni.createCameraContext()
					ctx.takePhoto({
						quality: 'high',
						success: function(resp){
							console.log(resp.tempImagePath);
							that.photoPath = resp.tempImagePath;
							that.showCamera = false;
							that.showImage = true;
							that.btnText = '签到';
						}
					});
				}else{
					uni.showLoading({
						title:"签到中请稍等"
					})
					setTimeout(function(){
						uni.hideLoading()
					},30000)
					uni.getLocation({
											type:"wgs84",
											success:function(resp){
												let latitude=resp.latitude
												let longitude=resp.longitude
												console.log('当前位置的经度：'+latitude)
												console.log('当前位置的纬度'+longitude)
												qqmapsdk.reverseGeocoder({
													location:{
														latitude:latitude,
														longitude:longitude
													},
													success:function(resp){
														console.log(resp.result)
														let address = resp.result.address
														let addressComponent = resp.result.address_component
														let nation = addressComponent.nation
														let province = addressComponent.province
														let city= addressComponent.city
														let district = addressComponent.district
														uni.uploadFile({
															url:that.url.checkin,
															filePath:that.photoPath,
															name:"photo",
															header:{
																token:uni.getStorageSync("token")
															},
															formData:{
																address:address,
																country:nation,
																province:province,
																city:city,
																district:district
															},
															success:function(resp){
																console.log(resp)
																if(resp.statusCode == 500 &&resp/data=='不存在人脸模型'){
																	uni.hideLoading()
																	uni.showModal({
																		title:'提示信息',
																		content:'EMOS系统中不存在你的人脸识别模型，是否使用当前这张照片作为人脸识别模型？',
																		success:function(res){
																			if(res.confirm){
																				uni.uploadFile({
																					url:that.url.createFaceModel,
																					filePath:that.photoPath,
																					name:"photo",
																					header:{
																						token:uni.getStorageSync("token")
																					},
																					success:function(resps){
																						if(resp.statusCode ==500){
																							uni.showToast({
																								title: resp.data,
																								icon:'none'
																							});)
																						}else if(resp.statusCode == 200){
																							uni.showToast({
																								title:'人脸建模成功',
																								icon:'none'
																							})
																						}
																					}
																			})
																		}
																	})
																}
															}
															else if(resp.statusCode == 200){
																let data = JSON.parse(resp.data)
																let code = data.code
																let msg = data.msg;
																if(code == 200){
																	uni.hideLoading();
																	//签到成功
																	uni.showToast({
																		title:'签到成功',
																		complete:function(){
																			//TODO 跳转到签到结果统计页面
																		}
																	})
																}
															}else if(resp.statusCode == 500){
																uni.showToast({
																	title:resp.data,
																	icon:'none'
																})
															}
														}
													}
												})
						
						}
					})
				}
			},
			afresh:function(){
				this.showCamera = true;
				this.showImage = false;
				this.btnText = '拍照';
			}
		}
	}
</script>

<style lang="less">
	@import url('checkin.less');
</style>
