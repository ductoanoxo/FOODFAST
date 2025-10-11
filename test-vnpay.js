const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

// Test VNPay Configuration
const vnpayConfig = {
    vnp_TmnCode: '1C1PQ01T',
    vnp_HashSecret: 'VTN3PF8TMIMQNLDOYTM93JOE4XI8C62L',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: 'http://localhost:3000/payment/vnpay/return',
};

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Test create payment URL
function testCreatePaymentURL() {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const ipAddr = '127.0.0.1';
    
    const vnp_TxnRef = moment(date).format('DDHHmmss');
    const amount = 100000; // 100,000 VND
    const locale = 'vn';
    const currCode = 'VND';
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = vnp_TxnRef;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + vnp_TxnRef;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    console.log('Before sort:', vnp_Params);
    
    vnp_Params = sortObject(vnp_Params);
    
    console.log('After sort:', vnp_Params);
    
    const signData = querystring.stringify(vnp_Params, { encode: false });
    console.log('Sign Data:', signData);
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('Signature:', signed);
    
    vnp_Params['vnp_SecureHash'] = signed;
    
    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
    
    console.log('\n=== PAYMENT URL ===');
    console.log(paymentUrl);
    console.log('\n=== TRANSACTION INFO ===');
    console.log('Transaction ID:', vnp_TxnRef);
    console.log('Amount:', amount, 'VND');
    console.log('Create Date:', createDate);
}

testCreatePaymentURL();
