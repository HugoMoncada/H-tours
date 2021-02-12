const path = require("path");
const express = require("express");
const DbConnection = require("./config/database");
const dotenv = require('dotenv').config();
const morgan = require("morgan");
const mongoose = require("mongoose");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const {webhookCheckout} = require("./controllers/bookingController");
const Booking = require("./models/BookingModel"); 
const User = require("./models/UserModel"); 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;

const app = express(); 

// allow heroku as a proxy
app.enable("trust proxy")

app.set("view engine", "pug"); 
app.set("views", path.join(__dirname, "views") );
app.use(express.static(path.join(__dirname, "public")));


const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const viewRoutes = require("./routes/viewRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

DbConnection();



// *MIDDLEWARES
app.use(cors());
app.options("*", cors());
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
 
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(morgan("dev"));

// *ROUTES
// !This route is here because it CAN'T be parsed to json, this data is neccesary as RAW data
// this post request is send by stripe as a webhook
app.post("/webhook-checkout", express.raw({type: "application/json"}), async (req,res) => {
    
    console.log("inside the hook")

    const signature = req.headers['stripe-signature'];
    let event;

    try {

      event = JSON.parse(req.body);
  
    } catch (err) {
  
      console.log(`⚠️  Webhook error while parsing basic request.`, err.message);
  
      return res.send();
  
    }

    try {
          // This req.body comes as raw not as json 
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET); 

    } catch (error) {
        // stripe recives this error it called this endpoint
        return res.status(400).send(`Web hook error:  ${error}` );
    }

    if(event.type === "checkout.session.completed"){
        console.log("checkout session ok! creating booking ✔✔")
        const stripeSession = event.data.object
        console.log("OBJETO EVENT ✨", event);
        console.log("OBJETO QUE DEVUELVE 🐱‍🏍", stripeSession);

        console.log("ESTE ES EL ID DEL TOUR 😊", stripeSession.client_reference_id);
        console.log("ESTE ES EL email DEL TOUR 😊", stripeSession.customer_details.email);
        console.log("ESTE ES EL precio DEL TOUR 😊", stripeSession.amount_total);


        const tour = stripeSession.client_reference_id; 

        const {id} = await User.findOne({email: stripeSession.customer_details.email});

        const price = stripeSession.amount_total / 100; 

        await Booking.create({ tour, id, price }); 

        return res.status(200).json({
            recived: true,
        });
    }

    res.send()

});







// Body and Cookie parser from the request
app.use(express.json( {limit: "10kb"} ) );
app.use(cookieParser());
// To be able to see data coming from forms in the views
app.use(express.urlencoded({extended: true, limit: "10kb"}));
// Data sanitization against noSQL query injection 
app.use(mongoSanitize());
// Data sanitization agains Xss attacks. html with js in it.  
app.use(xss());
const limiter = rateLimit({
    // allow 100 request in 1 hour
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request From this IP, please try again in one hour"
});
app.use("/api", limiter);
// Prevent parameter polution
app.use(hpp({
    whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
    ]
})
);
// Works only for text
app.use(compression());





app.use("/api/v1/tours",tourRoutes);
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/", viewRoutes );


// *404 all routes
app.all("*", (req,res, next)=> {
    res.status(404).json({
        status: "Fail",
        message: `Can't find ${req.originalUrl} on this server`
    });

    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.status = "Fail";
    err.statusCode = 404;

    // express asume that the argument in next is an error
    // skips the rest of the middlewares
    next(err);
});


const server = app.listen(port, () => {console.log(`Server On!! ✔ port ${port}`)});


process.on("SIGTERM", () => {
  console.log("SIGTERM recived from app host shutting down!")
   server.close( ()=> {
     console.log(" Process terminated ");
   });
});

