const Tour = require("../models/TourModel")
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
            success_url: `${req.protocol}://${req.get("host")}/`,
            cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
            customer_email: `${req.user.email}`,
            // To create a bookin in the db later
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