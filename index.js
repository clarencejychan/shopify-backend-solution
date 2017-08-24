const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var request = require('request');

// Normalizes all properties so that they have the same fields.
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

// Performs the validation check.
var validateInfo = function(customerField, customer, validateProps) {
  var hasError = false;
  if (validateProps['required']) {
    if (customer[customerField] === null) {
      hasError = true;
      return hasError;
    }
  }
  if (validateProps['type'] !== null) {
    if (customer[customerField] !== null && (typeof customer[customerField] !== validateProps['type'])) {
      hasError = true;
      return hasError;
    }
  }

  if (validateProps['length'] !== null) {
    if (validateProps['length'].hasOwnProperty('min')) {
      if (customer[customerField] !== null && (customer[customerField].length < validateProps['length']['min'])) {
        hasError = true;
        return hasError;
      }
    }

    if (validateProps['length'].hasOwnProperty('max')) {
      if (customer[customerField] !== null && (customer[customerField].length > validateProps['length']['max'])) {
        hasError = true;
        return hasError;
      }
    }
  }
  return hasError;
}

app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile('views/index.html', {root: __dirname });
});

app.post('/', function(req, res) {

  request.get(req.body.url, function(error, response, body) {
    var shopifyInfo = JSON.parse(body);
    var customerInfo;
    var invalidCustomers = {
      "invalidCustomers": []
    }
    var listofValidations = [];

    // Normalizes and finds out which fields to validate.
    if (shopifyInfo.hasOwnProperty('validations')) {
      for (var i in shopifyInfo.validations) {
        for (key in shopifyInfo.validations[i]) {
          listofValidations.push(key);
          // Info Normalized
          var normalizedProp = normalizeValidation(shopifyInfo.validations[i][key]);
          shopifyInfo.validations[i][key] = normalizedProp;
          // Must cycle through now to build incorrect fields in customers
        }
      }
    }

    if (shopifyInfo.hasOwnProperty('customers')) {
      customerInfo = shopifyInfo.customers;
    }

    // Checks customers for validation
    for (k in customerInfo) {
      var localErrors = [];
      for (customerField in customerInfo[k]) {
        if (listofValidations.indexOf(customerField) > -1) {
          // Find the normalized prop
          var prop;

          for (var l in shopifyInfo.validations) {
            for (key2 in shopifyInfo.validations[l]) {
              if (customerField === key2) {
                prop = shopifyInfo.validations[l][key2];
              }
            }
          }

          var fieldError = validateInfo(customerField, customerInfo[k], prop);
          if (fieldError) {
            localErrors.push(customerField);
          }
        }
      }

      if (localErrors.length > 0) {
        var error = {
          'id': customerInfo[k]['id'],
          'invalid_fields': localErrors
        };
        invalidCustomers["invalidCustomers"].push(error);
      }
    }

    res.send(invalidCustomers);
  });


});

app.listen(process.env.PORT || 3030, function () {
  console.log('Example app listening on port 3030!')
});
