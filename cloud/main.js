//Stripe Test SecretKey
//var Stripe = require('stripe')
//Stripe.initialize('sk_test_ePDSBK4YqUagVl3dkjzjpDt1');
var Stripe = require('stripe')('sk_test_ePDSBK4YqUagVl3dkjzjpDt1');
 
//var stripeSecretKey = 'sk_test_ePDSBK4YqUagVl3dkjzjpDt1';
//var stripeBaseURL = 'api.stripe.com/v1';
 
Parse.Cloud.define("saveStripeCustomerIdAndCharge", function (request, response) {

Stripe.customers.create({
  source: request.params.token,
  email: request.params.email
  }, function(err, success) {
        if (err) {
            response.error(err)
        } else {
             var saveId = request.user;
            saveId.set("stripe_customer_id", success.id);
            saveId.save(null,{"useMasterKey":true});
           /* var query = new Parse.Query('User');
            query.equalTo("objectId", user);
            query.find({ sessionToken: token }).then(function(confirm) {
            getUserToken.set("stripe_customer_id", user);
            response.success(confirm);
             });*/
            response.success(success)

        }

}).then(function (customer) {
    Stripe.charges.create({
       amount: request.params.amount,
       currency: 'usd',
       customer: customer.id 
    });

});
});
/*Parse.Cloud.define("stripeChargeCustomer", function(request, response) {
      Stripe.charges.create({
      amount: request.params.amount,
      currency: "usd",
      customer: request.params.customerId,
      description: request.params.description
    },{
    success: function(results) {
      response.success(results);
    },
    error: function(httpResponse) {
      response.error(httpResponse);
    }
  
});
});*/
/*Parse.Cloud.define("stripeDeleteCard", function (request, response) {
    Parse.Cloud.httpRequest({
        method: "DELETE",
        url: "https://" + stripeSecretKey + ':@' + stripeBaseURL + "/customers/" + request.params.customerId + "/sources/" + request.params.cardId,
        // body: "id="+request.params.cardId,
        success: function (cards) {
            console.log(JSON.stringify(cards));
            response.success(cards);
        },
        error: function (httpResponse) {
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
});*/
Parse.Cloud.define("stripeGetDefaultCard", function (request, response) {

    var customerId = request.params.customerId;

    Stripe.customers.retrieve(
    customerId,
    function(err, customer) {
        if (err){
            response.error(err)
        }

        else {
            var creditCardResponse = {
 
                "id": customer.id,
                "cardId": customer.sources.data[0].id,
                "cardHolderEmail": customer.email,
                "cardBrand": customer.sources.data[0].brand,
                "cardLast4Digits": customer.sources.data[0].last4
 
            };

            response.success(creditCardResponse);
            //response.success(customer)
        }
    // asynchronously called
  }
);
 
});
 
/*Parse.Cloud.define("stripeCheckDuplicateToken", function (request, response) {
    Parse.Cloud.httpRequest({
        url: "https://" + stripeSecretKey + ':@' + stripeBaseURL + "/tokens/" + request.params.tokenId,
        success: function (card) {
            console.log(JSON.stringify(card));
        response.success(card);
        },
        error: function (httpResponse) {
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
});
 */
Parse.Cloud.define("stripeAddCardToCustomer", function (request, response) {
var customerId = request.params.customerId;
var token = request.params.tokenId;

Stripe.customers.createSource(
  customerId,
  {source: token},
  function(err, card) {

    if (err){
        response.error(err)
    } else {
        response.success(card);
    }
    // asynchronously called
  }
);

   /* Parse.Cloud.httpRequest({
        method: "POST",
        url: "https://" + stripeSecretKey + ':@' + stripeBaseURL + "/customers/" + request.params.customerId + "/sources",
        body: "card=" + request.params.tokenId,
 
        //check for duplicate fingerPrintIds
        success: function (httpResponse) {
            var jsonObj = JSON.parse(httpResponse.text)
            var jsonResult = (jsonObj['fingerprint']);
            console.log("New fingerprint:" + jsonObj['fingerprint']);
            console.log(httpResponse.text);
            var cardResponse = {
 
                "fingerPrint": jsonResult,
            };
 
            response.success(cardResponse);
            //response.success(httpResponse.text);
 
        },
        error: function (httpResponse) {
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });*/
 
 
});
 
Parse.Cloud.define("addRating", function (request, response) {
    var userId = request.params.user_id;
    var rating = request.params.rating;
    var query = new Parse.Query("User");
    query.equalTo("objectId", userId);
    query.find({ useMasterKey: true }) ({
        success: function (results) {
            if (results.length > 0) {
                var user = results[0];
                //Parse.Cloud.useMasterKey();
                user.add("rating", rating);
                var ratings = user.get('rating');
                var medianRating = 0.0;
                ratings.forEach(function (item, i, arr) {
                    medianRating = medianRating + item;
                });
                medianRating = medianRating / ratings.length;
                user.set("medianRating", medianRating);
                var points = user.get('points');
                if (points == null) {
                    points = 0
                }
                user.set('points', points + rating * 10);
                user.save(null, {
                    success: function (results) {
                        response.success(medianRating);
                    },
                    error: function () {
                        response.error(String(error));
                    }
                })
            } else {
                response("Can find user");
            }
        },
        error: function () {
            response.error(String(error));
        }
    });
});
 
/*
 Parse.Cloud.beforeSave("Experience", function(request, response){
 
 var newEntry = request.object;
 
 var checkPrevious = new Parse.Query("Experience");
 checkPrevious.equalTo("positionTitle", newEntry.get("positionTitle"));
 checkPrevious.equalTo("companyName", newEntry.get("companyName"));
 
 checkPrevious.first({
 success: function(object) {
 
 if(object){
 response.error({errorCode: 123, errorMsg: "Already entered this value"});
 } else {
 response.success();
 }
 },
 error: function(error) {
 response.error("Could not validate uniqueness of object");
 }
 });
 });
 */