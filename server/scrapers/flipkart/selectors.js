module.exports = {
  search: {
    resultItem: 'div[data-id]', // Flipkart search result cards usually have data-id
    title: '.KzDlHZ, .WKTcLC, .s1Q9rs', // Various title classes for different views
    priceWhole: '.Nx9bqj', 
    link: 'a.CGtC98, a.VJA3hP', 
    image: 'img.DByuf4'
  },
  antiBot: {
    captchaBody: 'form[action*="/captcha"]'
  }
};
