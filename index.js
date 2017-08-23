const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var request = require('request');

var normalizeValidation = function(validProperty) {
  if (!validProperty.hasOwnProperty('required')) {
    validProperty['required'] = false;
  }
  if (!validProperty.hasOwnProperty('type')) {
    validProperty['type'] = null;
  }
  if (!validProperty.hasOwnProperty('length')) {
    validProperty['length'] = null
  }

  return validProperty;
}

var validateInfo = function(customerField, customer, validateProps) {
  var invalidFields = [];
  if (validateProps['required'] !== null) {
    if (!customer.hasOwnProperty(customerField)) {
      if (invalidFields.indexOf(customerField) === -1) {
        invalidFields.push(customerField)
      }
    }
  }
  if (validateProps['type'] !== null) {
    if (typeof customer[customerField] !== validateProps['type']) {
      if (invalidFields.indexOf(customerField) === -1) {
        invalidFields.push(customerField)
      }
    }
  }

  if (validateProps['length'] !== null) {
    //min max case
  }

  return invalidFields;
}

app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile('views/index.html', {root: __dirname });
});

app.post('/', function(req, res) {
  console.log(req.body.url);

  request.get(req.body.url, function(error, response, body) {
    var shopifyInfo = JSON.parse(body);
    var customerInfo;
    var invalidCustomers = {
      invalidCustomers: []
    }

    if (shopifyInfo.hasOwnProperty('validations')) {
      for (var i in shopifyInfo.validations) {
        for (key in shopifyInfo.validations[i]) {

          // Info Normalized
          var normalizedProp = normalizeValidation(shopifyInfo.validations[i][key]);

          // Must cycle through now to build incorrect fields in customers
          if (shopifyInfo.hasOwnProperty('customers')) {
              customerInfo = shopifyInfo.customers
          }

          for (k in customerInfo) {
            console.log(customerInfo[k])
            for (customerField in customerInfo[k]) {
              if (customerField === key) {
                console.log(customerField);
                validatedFields = validateInfo(customerField, customerInfo[k], normalizedProp);
                if (!validatedFields.length > 0) {
                  // We know there are errors
                  var error = {
                    'id': customerInfo[k]['id'],
                    'invalid_fields': validatedFields
                  }
                }
              }
            }
          }


        }
      }
    }
    res.send(invalidCustomers);
  });


});

app.listen(process.env.PORT || 3030, function () {
  console.log('Example app listening on port 3030!')
});
