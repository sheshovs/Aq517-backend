import express from "express"
import cors from "cors"
import axios from "axios";
import routes from "./src/api/routes/index.js"

const app = express()

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(routes)


app.post("/api/mercadopago/create_preference", async (req, res) => {

  const mercadoPagoUrl = `https://api.mercadopago.com/checkout/preferences?access_token=TEST-5849597827836358-101417-23c615c14370e68bfa7a84053ea4e2c2-62109829`

  const preferenceData = {
		items: req.body.items,
    auto_return: "approved",
		back_urls: {
			"success": "https://aq517.netlify.app/",
			"failure": "https://aq517.netlify.app/",
			"pending": "https://aq517.netlify.app/"
		},
	}

  try {
    const response = await axios.post(mercadoPagoUrl, preferenceData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    res.status(200).json({
      url: response.data.init_point,
    })
  } catch (error) {
    res.status(400).json(error)
    console.log(error)
  }

});


app.get('/api/mercadopago/feedback', function (req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	});
});




app.get("/", (req, res) => {
    res.send("Hello World!")
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`)
})