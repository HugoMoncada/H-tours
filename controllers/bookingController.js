const Tour = require("../models/TourModel")
const Booking = require("../models/BookingModel"); 
const User = require("../models/UserModel"); 

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckOutSession = async (req,res,next) => {
    // 1. Get the current booked tour
    const tour = await Tour.findById(req.params.tourId); 
    if(!tour){
        return res.status(400).json({
            status: "Fail", 
            message: "Tour not found"
        }); 
    }

    try {
        // 2. Create checkout session 
        const session = await stripe.checkout.sessions.create({
            // Session information
            payment_method_types: ["card"],
            success_url: `${req.protocol}://${req.get("host")}/my-tours`,
            cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
            customer_email: `${req.user.email}`,
            // To create a booking in the db later
            client_reference_id: req.params.tourId,

            //Product information
            line_items: [
                {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://www.aerobusbcn.com/blog/wp-content/uploads/2019/03/viajar-tour-700x500.jpg`],
                    // X100 beacuse is spected to be on cents
                    amount: tour.price *100,
                    currency: "usd",
                    quantity: 1
                }
            ]
        }); 

        // 3. Create session as response
        return res.status(200).json({
            status: "Success", 
            session
        });

    } 
    catch (error) {
        // console.log(error)
        return res.status(500),json({
            status: "Error", 
            message: error
        }); 
    }
}


const createBooking = async (stripeSession) => {
    // tour ID sent in the session 
    
    const tour = stripeSession.client_reference_id; 

    const user = (await User.findOne({email: stripeSession.customer_details.email})).id;

    const price = stripeSession.amount_total / 100; 

    await Booking.create({ tour, user, price }); 

    return res.status(200).json({
        recived: true,
    });

}

// This gets used from the index route at the top ...
// !THIS ONLY WORKS ONCE THE SITE IS UPLOADED CAUSE IT USES WEBHOOK FROM STRIPE ON A SERVER
exports.webhookCheckout = async (req,res,next) => {
   
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

        createBooking(event.data.object);

        return res.status(200).json({
            recived: true,
        });
    }

    res.send();

}