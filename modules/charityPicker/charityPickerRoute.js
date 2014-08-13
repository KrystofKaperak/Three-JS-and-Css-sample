/*global $:false, NP: false */
/*jshint strict:false, devel:true */

var charityPickerRoute = {
	'/sponsorship': {
		on: function() {
			function initCharityPicker(){
				var accountId = NP.user.accountId();
			    var height = NP.config.screenHeight();
			    var width = NP.config.screenWidth();
			    
			    var charityPicker = new NP.module.CharityPicker(accountId, height, width);
		        charityPicker.init();
			}
			$("#appContainer").displayManager('charity-container',{
				template : "charityPicker",
				data : {},
				callback: initCharityPicker
			});
			// $("#appContainer").loadFromTemplate({
			// 	template : "charityPicker",
			// 	data : {},
			// 	callback: initCharityPicker
			// });
		}
	},
 	//these routes are for testing template layout only and should be commented out for production
	'/charityPickerPreview':
	{
		on: function() {
			function initCharityPickerPreview(){
				$('.charity-preview').css({'position':'absolute', 'top':'100px', 'left':'30px'});
			};
			$("#appContainer").loadFromTemplate({
				template : "charityPreview",
				data : {"name": "The Charity Service Limited", "registration": "Registered charity No. 1011293", "ourLogoFile": "/charity/185315.jpg",  "description": 'We are a charities intermediary and offer a range of "One Stop Shop" services that support charitable giving efficiently & safely. Our services include Payroll giving, Online fundraising, Personalised charitable trusts, Legacy service, Grant making, Charity governance & administration.' },
				callback: initCharityPickerPreview
			});
		}
	},
	'/charityPickerDetails':
	{
		on: function() {
			function initCharityPickerDetails(){
				$('.charity-details').css({'position':'absolute', 'top':'200px', 'left':'200px', 'transform':'scale(2)'}); //, 
			};
			$("#appContainer").loadFromTemplate({
				template : "charityDetails",
				data : {"name": "The Charity Service Limited", "website":"www.justgiving.com", "registration": "Registered charity No. 1011293", "logo": "/images/charity.jpg",  "description": 'We are a charities intermediary and offer a range of "One Stop Shop" services that support charitable giving efficiently & safely. Our services include Payroll giving, Online fundraising, Personalised charitable trusts, Legacy service, Grant making, Charity governance & administration. Blab blabalaadsfkalsdfala adflkad sflasdfalsd falsdflas dlfa asdf asdfasdf dsa  dflkasfd lask fdlaskfa dlfjsdlafdsadsfasadf asdfasd dsf asdfasdfasdf sadf asdf afa sadf asdf sadf sdaf asdfas dfasdf asdfasd dasfsdaf asd fdsf asdf asdf asdf asdf sadf sdf asdf as sdfasdfsdfa dfas dfasadsfasd fasdf asdf asdfas dfasdfasd  adf' },
				callback: initCharityPickerDetails
			});
		}
	},
};

var charityPickerRouter = Router(charityPickerRoute);
charityPickerRouter.init();
