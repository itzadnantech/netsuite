var extensions = {};

extensions['SSD.HideCheckoutCreditCardPaymentExtension.1.0.0'] = function(){

function getExtensionAssetsPath(asset){
return 'extensions/SSD/HideCheckoutCreditCardPaymentExtension/1.0.0/' + asset;
};

define(
	'OrderWizard.Module.PaymentMethod.Creditcard.Extension',
	[
        'OrderWizard.Module.PaymentMethod.Creditcard' // reference the core module here
        , 'SC.Configuration'
        , 'underscore'
	],
	function (
        OrderWizardModulePaymentMethodCreditcard
        , Configuration
        , _
	) {
        'use strict';

        _.extend(OrderWizardModulePaymentMethodCreditcard.prototype, {

            // @method isActive Indicate if in the current state this module is active to be shown or not
            // @return {Boolean}
            isActive: function () {

                const a_credit_card = _.findWhere(
                    Configuration.get('siteSettings.paymentmethods', []),
                    {
                        creditcard: 'T'
                    }
                );

                // Copied from the invoice terms. Returns the customer's profile.
                if (this.wizard && this.wizard.options && this.wizard.options.profile) {
                    var profile = this.wizard.options.profile;

                    // If they have the option to pay by invoice, don't show the credit card option.
                    const terms =  profile.get('paymentterms');
                    if (terms && terms.internalid) return false;
                }
              

                return a_credit_card && !!a_credit_card.internalid;
            }

        });
    }
);



define(
	'HideCreditCardPaymentExtension'
,   [
		'OrderWizard.Module.PaymentMethod.Creditcard.Extension'
	]
,   function (
		OrderWizardModulePaymentMethodCreditcardExtension
	)
	{
		'use strict';

		return  {
			mountToApp: function mountToApp (container)
			{
			}
		};
	}
);


};

extensions['SSD.NewCustomerExtension.1.0.1'] = function(){

function getExtensionAssetsPath(asset){
return 'extensions/SSD/NewCustomerExtension/1.0.1/' + asset;
};

// @module SSD.NewCustomerExtension.NewCustomerExtension
define('NewCustomerExtension.LoginRequest.View'
,	[
    'newcustomerextension_loginrequest.tpl'
    
    ,	'NewCustomerExtension.Model'
    ,	'Backbone.FormView'
    ,	'Backbone'
    ,	'underscore'
    ]
, function (
    newcustomerextension_loginrequest_tpl
    
    ,	NewCustomerExtensionModel
    ,	BackboneFormView
    ,	Backbone
    , 	_
)
{
    'use strict';

    // @class SSD.NewCustomerExtension.NewCustomerExtension.View @extends Backbone.View
    return Backbone.View.extend({

        template: newcustomerextension_loginrequest_tpl

    ,	formSelector: "form[data-action='submitLoginRequest']"

    ,	events: {
            'submit form[data-action="submitLoginRequest"]': 'submitLoginRequest'
        }

     ,	bindings: {
            '[name="firstname"]': 'firstname'
        ,	'[name="lastname"]': 'lastname'
        ,	'[name="email"]': 'email'
         , '[name="accountnumber"]': 'accountnumber'
         // These are needed so if the form is submitted and an error happens, they aren't lost.
         , '[name="addr1"]': 'addr1'
         , '[name="addr2"]': 'addr2'
         , '[name="city"]': 'city'
         , '[name="zip"]': 'zip'
         , '[name="phone"]': 'phone'
         , '[name="fax"]': 'fax'
        }

    ,	feedback: {
            'OK' : {
                'type': 'success'
            ,	'message': _('Successfully submitted form!').translate()
            }, 'ERROR': {
                'type': 'error'
            ,	'message': _('Sorry, an error has occured.').translate()
            }, 'ERROR_CUSTOMER': {
                'type': 'error'
            ,	'message': _('Invalid customer account number.').translate()
            }
        }

    ,	initialize: function (options) {
            this.options = options;
            this.application = options.application;
            this.model = options.model || new NewCustomerExtensionModel();
            var environmentComponent = options.container.getComponent('Environment');
            this.confirmationMessage = environmentComponent.getConfig("NewCustomerExtension.confirmationMessage") || "";
            BackboneFormView.add(this);
        }

    ,	submitLoginRequest: function submitLoginRequest(e, model, props) {
            e.preventDefault();
            var self = this;
            try {
                var $form = this.$(e.target)
                ,	form_data = $form.serializeObject();
                Backbone.Validation.bind(this);
                var isValid = this.model._validate(form_data, {validate: true});
                if(isValid) {
                    var	promise = self.saveForm(e, self.model);
                    if (promise) {
                        promise.always(function (response) {
                            console.log("response", response);

                            // Lookup the error or success message and translate it.
                            self.message = self.feedback[response.code].message;
                            self.type = self.feedback[response.code].type;
                            self.render();
                        });
                    }
                }
            }
            catch (ex) {
                console.log(ex);
            }
        }

        //@method getContext @return SSD.NewCustomerExtension.NewCustomerExtension.View.Context
    ,	getContext: function getContext()
        {
            var self = this;
            return {
                message: self.message,
                type: self.type,
                showConfirmationMessage: self.type === 'success',
                confirmationMessage: self.confirmationMessage,
                showErrorMessage: self.type === 'error',
                errorMessage: self.message
            };
        }
    });
});


// Model.js
// -----------------------
// @module Case
define("NewCustomerExtension.Model", ["Backbone", "Utils", "underscore"], function(
    Backbone,
    Utils,
    _
) {
    "use strict";

    function validateFax(value) {
        if (!value || value.length === 0) return "";
        return _.validatePhone(value);
    }

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "services/NewCustomerExtension.Service.ss"
            )
        )    
        , accountnumber: '' 
        , email: ''
        , firstname: ''
        , lastname: ''
        , addr1: ''
        , addr2: ''
        , city: ''
        , zip: ''
        , phone: ''
        , fax: ''

        

    ,	validation: {
            firstname: { required: true, msg: _('First name is required').translate() }
        ,	lastname: { required: true, msg: _('Last name is required').translate() }
        ,	email: { required: true, pattern: 'email', msg: _('A valid email is required').translate() }
        ,	accountnumber: { required: true, msg: _('Account Number is required').translate() }
        ,	addr1: { required: true, msg: _('Address is required').translate() }
        ,	city: { required: true, msg: _('City is required').translate() }
        ,	zip: { required: true, msg: _('Postal/ZIP Code is required').translate() }
        ,	phone: { fn: _.validatePhone, msg: _('Phone is required').translate() }
        ,   fax: { fn: validateFax, msg: _('Fax is invalid').translate() }
        }
    });
});


// @module SSD.NewCustomerExtension.NewCustomerExtension
define('NewCustomerExtension.View'
,	[
	'newcustomerextension.tpl'
	
	
	,	'Backbone'
    ]
, function (
	newcustomerextension_tpl
	
	
	,	Backbone
)
{
    'use strict';

	// @class SSD.NewCustomerExtension.NewCustomerExtension.View @extends Backbone.View
	return Backbone.View.extend({

		template: newcustomerextension_tpl

	,	initialize: function (options) {

		}

		//@method getContext @return SSD.NewCustomerExtension.NewCustomerExtension.View.Context
	,	getContext: function getContext()
		{
			//@class SSD.NewCustomerExtension.NewCustomerExtension.View.Context
			this.message = this.message || 'Hello World!!'
			return {
				message: this.message
			};
		}
	});
});



define(
	'NewCustomerExtension'
,   [
		'NewCustomerExtension.View'
	,	'NewCustomerExtension.LoginRequest.View'
	]
,   function (
		NewCustomerExtensionView
	,	NewCustomerExtensionLoginRequestView
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{
			var layout = container.getComponent('Layout');
			if(layout) {
				layout.addChildView('NewCustomerExtension', function() { 
					return new NewCustomerExtensionView({ container: container });
				});
				layout.addToViewContextDefinition('LoginRegister.View', 'showNewCustomerExtension', 'boolean', function (context) {
					return true;
				});

				const pageType = container.getComponent('PageType');
				pageType.registerPageType({
					name: 'login-request',
					routes: ['login-request', 'login-request?*params'],
					view: NewCustomerExtensionLoginRequestView
				});
			}
		}
	};
});


};

try{
	extensions['SSD.HideCheckoutCreditCardPaymentExtension.1.0.0']();
	SC.addExtensionModule('HideCreditCardPaymentExtension');
}
catch(error)
{
	console.error(error)
}

try{
	extensions['SSD.NewCustomerExtension.1.0.1']();
	SC.addExtensionModule('NewCustomerExtension');
}
catch(error)
{
	console.error(error)
}


SC.ENVIRONMENT.EXTENSIONS_JS_MODULE_NAMES = ["HideCreditCardPaymentExtension","OrderWizard.Module.PaymentMethod.Creditcard.Extension","NewCustomerExtension.LoginRequest.View","NewCustomerExtension.Model","NewCustomerExtension.View","NewCustomerExtension"];


///ad_script
///custome js for social buttons
var script = document.createElement('script'); 
script.src = "https://6761736.app.netsuite.com/core/media/media.nl?id=220431&c=6761736&h=37uB4OcVZTZ4CpFQYOrPcHBB2UlCN44WKI8LBNv8u06nprBI&mv=l5nl2iiw&_xt=.js&fcts=20220716004429&whence=";
document.head.appendChild(script);
