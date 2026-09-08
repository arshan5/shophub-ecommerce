const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");
const Review = require("./models/Review");
const Category = require("./models/Category");
const Setting = require("./models/Setting");
const Subscriber = require("./models/Subscriber");
const Address = require("./models/Address");

const {
  sendEmail,
  createEmailTemplate,
} = require("./email");

const app = express();
const PORT = 5000;


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());


// =========================
// AUTH MIDDLEWARE
// =========================

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};


// =========================
// ADMIN MIDDLEWARE
// =========================

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};


// =========================
// UPLOADS
// =========================

const uploadsPath = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, {
    recursive: true,
  });
}

app.use(
  "/uploads",
  express.static(uploadsPath)
);


// =========================
// MULTER
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =========================
// HELPER FUNCTIONS
// =========================

function generateVerificationCode() {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function generateResetToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}


// =========================
// CONTACT FORM
// PUBLIC
// =========================

app.post(
  "/api/contact",
  async (req, res) => {
    try {
      const {
        name,
        email,
        subject,
        message,
      } = req.body;

      if (
        !name?.trim() ||
        !email?.trim() ||
        !message?.trim()
      ) {
        return res.status(400).json({
          message:
            "Name, email and message are required.",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      const cleanName = name.trim();

      const cleanSubject =
        subject?.trim() || "General Inquiry";

      const cleanMessage =
        message.trim();

      // =========================
      // ADMIN CONTACT EMAIL
      // =========================

      const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>New Contact Message</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 15px;">

      <table
        width="600"
        cellpadding="0"
        cellspacing="0"
        style="
          max-width:600px;
          width:100%;
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
        "
      >

        <tr>
          <td style="
            background:#111827;
            padding:28px 30px;
          ">

            <div style="
              font-size:26px;
              font-weight:bold;
              color:#ffffff;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

            <div style="
              font-size:13px;
              color:#aeb5c2;
              margin-top:5px;
            ">
              New Contact Message
            </div>

          </td>
        </tr>

        <tr>
          <td style="padding:35px 30px;">

            <h1 style="
              margin:0 0 20px;
              font-size:24px;
              color:#111827;
            ">
              New Contact Message
            </h1>

            <div style="
              background:#f9fafb;
              border:1px solid #e5e7eb;
              border-radius:10px;
              padding:20px;
            ">

              <p style="
                margin:0 0 12px;
                font-size:15px;
                color:#444444;
              ">
                <strong>Name:</strong>
                ${cleanName}
              </p>

              <p style="
                margin:0 0 12px;
                font-size:15px;
                color:#444444;
              ">
                <strong>Email:</strong>
                ${normalizedEmail}
              </p>

              <p style="
                margin:0;
                font-size:15px;
                color:#444444;
              ">
                <strong>Subject:</strong>
                ${cleanSubject}
              </p>

            </div>

            <div style="
              margin-top:20px;
              padding:20px;
              background:#f5f7ff;
              border:1px solid #e0e7ff;
              border-radius:10px;
            ">

              <div style="
                font-size:12px;
                color:#777777;
                margin-bottom:10px;
                font-weight:bold;
              ">
                MESSAGE
              </div>

              <div style="
                font-size:15px;
                color:#444444;
                line-height:1.7;
                white-space:pre-wrap;
              ">
                ${cleanMessage}
              </div>

            </div>

          </td>
        </tr>

        <tr>
          <td style="
            background:#f9fafb;
            padding:25px 30px;
            text-align:center;
            border-top:1px solid #eeeeee;
          ">

            <div style="
              font-size:15px;
              font-weight:bold;
              color:#111827;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

            <p style="
              margin:8px 0;
              font-size:12px;
              color:#888888;
            ">
              This message was sent through the
              ShopHub contact form.
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

      await sendEmail(
        process.env.ADMIN_EMAIL,
        `ShopHub Contact: ${cleanSubject}`,
        adminHtml
      );


      // =========================
      // CUSTOMER CONFIRMATION EMAIL
      // =========================

      const customerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Message Received</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 15px;">

      <table
        width="600"
        cellpadding="0"
        cellspacing="0"
        style="
          max-width:600px;
          width:100%;
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
        "
      >

        <tr>
          <td style="
            background:#111827;
            padding:28px 30px;
          ">

            <div style="
              font-size:26px;
              font-weight:bold;
              color:#ffffff;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

          </td>
        </tr>

        <tr>
          <td style="padding:35px 30px;">

            <h1 style="
              margin:0 0 15px;
              font-size:24px;
              color:#111827;
            ">
              Message Received
            </h1>

            <p style="
              font-size:15px;
              color:#444444;
              line-height:1.7;
            ">
              Hello ${cleanName},
            </p>

            <p style="
              font-size:15px;
              color:#666666;
              line-height:1.7;
            ">
              Thank you for contacting ShopHub.
              We have received your message and our team
              will get back to you as soon as possible.
            </p>

            <div style="
              margin:25px 0;
              padding:20px;
              background:#f5f7ff;
              border:1px solid #e0e7ff;
              border-radius:10px;
            ">

              <strong style="color:#111827;">
                Subject:
              </strong>

              <span style="color:#555555;">
                ${cleanSubject}
              </span>

            </div>

            <p style="
              font-size:14px;
              color:#777777;
              line-height:1.6;
            ">
              Please do not reply to this automated
              confirmation. Our support team will contact
              you directly.
            </p>

          </td>
        </tr>

        <tr>
          <td style="
            background:#f9fafb;
            padding:25px 30px;
            text-align:center;
            border-top:1px solid #eeeeee;
          ">

            <div style="
              font-size:15px;
              font-weight:bold;
              color:#111827;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

      // Customer email failure should not
      // make the contact request fail.

      try {
        await sendEmail(
          normalizedEmail,
          "We received your ShopHub message",
          customerHtml
        );
      } catch (customerEmailError) {
        console.error(
          "Customer contact confirmation email failed:",
          customerEmailError
        );
      }

      res.status(200).json({
        message:
          "Your message has been sent successfully.",
      });

    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send your message. Please try again.",
      });
    }
  }
);


// =========================
// CUSTOMER ADDRESSES
// =========================


// GET ALL ADDRESSES
// CUSTOMER ONLY

app.get(
  "/api/addresses",
  authMiddleware,
  async (req, res) => {
    try {
      const addresses =
        await Address.find({
          userId: req.user.id,
        }).sort({
          default: -1,
          createdAt: -1,
        });

      res.json(addresses);
    } catch (error) {
      console.error(
        "Get addresses error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch addresses.",
      });
    }
  }
);


// CREATE ADDRESS
// CUSTOMER ONLY

app.post(
  "/api/addresses",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        label,
        name,
        line1,
        city,
        country,
        postalCode,
        phone,
        default: isDefault,
      } = req.body;

      if (
        !label?.trim() ||
        !name?.trim() ||
        !line1?.trim() ||
        !city?.trim() ||
        !country?.trim() ||
        !postalCode?.trim() ||
        !phone?.trim()
      ) {
        return res.status(400).json({
          message:
            "All address fields are required.",
        });
      }

      const existingCount =
        await Address.countDocuments({
          userId: req.user.id,
        });

      const shouldBeDefault =
        existingCount === 0 ||
        isDefault === true;

      if (shouldBeDefault) {
        await Address.updateMany(
          {
            userId: req.user.id,
          },
          {
            $set: {
              default: false,
            },
          }
        );
      }

      const address =
        new Address({
          userId: req.user.id,
          label: label.trim(),
          name: name.trim(),
          line1: line1.trim(),
          city: city.trim(),
          country: country.trim(),
          postalCode: postalCode.trim(),
          phone: phone.trim(),
          default: shouldBeDefault,
        });

      await address.save();

      res.status(201).json({
        message:
          "Address added successfully.",
        address,
      });
    } catch (error) {
      console.error(
        "Create address error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add address.",
      });
    }
  }
);


// UPDATE ADDRESS
// CUSTOMER ONLY

app.put(
  "/api/addresses/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        label,
        name,
        line1,
        city,
        country,
        postalCode,
        phone,
        default: isDefault,
      } = req.body;

      const address =
        await Address.findOne({
          _id: req.params.id,
          userId: req.user.id,
        });

      if (!address) {
        return res.status(404).json({
          message:
            "Address not found.",
        });
      }

      if (
        !label?.trim() ||
        !name?.trim() ||
        !line1?.trim() ||
        !city?.trim() ||
        !country?.trim() ||
        !postalCode?.trim() ||
        !phone?.trim()
      ) {
        return res.status(400).json({
          message:
            "All address fields are required.",
        });
      }

      if (isDefault === true) {
        await Address.updateMany(
          {
            userId: req.user.id,
            _id: {
              $ne: req.params.id,
            },
          },
          {
            $set: {
              default: false,
            },
          }
        );
      }

      address.label = label.trim();
      address.name = name.trim();
      address.line1 = line1.trim();
      address.city = city.trim();
      address.country = country.trim();
      address.postalCode =
        postalCode.trim();
      address.phone = phone.trim();

      if (isDefault !== undefined) {
        address.default = isDefault;
      }

      await address.save();

      res.json({
        message:
          "Address updated successfully.",
        address,
      });
    } catch (error) {
      console.error(
        "Update address error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update address.",
      });
    }
  }
);


// DELETE ADDRESS
// CUSTOMER ONLY

app.delete(
  "/api/addresses/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const address =
        await Address.findOne({
          _id: req.params.id,
          userId: req.user.id,
        });

      if (!address) {
        return res.status(404).json({
          message:
            "Address not found.",
        });
      }

      const wasDefault =
        address.default;

      await Address.findByIdAndDelete(
        req.params.id
      );

      if (wasDefault) {
        const nextAddress =
          await Address.findOne({
            userId: req.user.id,
          }).sort({
            createdAt: -1,
          });

        if (nextAddress) {
          nextAddress.default = true;
          await nextAddress.save();
        }
      }

      res.json({
        message:
          "Address deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete address.",
      });
    }
  }
);


// =========================
// NEWSLETTER
// =========================


// SUBSCRIBE TO NEWSLETTER
// PUBLIC

app.post(
  "/api/newsletter/subscribe",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      const existingSubscriber =
        await Subscriber.findOne({
          email: normalizedEmail,
        });

      if (existingSubscriber) {
        return res.status(400).json({
          message:
            "This email is already subscribed.",
        });
      }

      const subscriber =
        new Subscriber({
          email: normalizedEmail,
        });

      await subscriber.save();

      console.log(
        "Newsletter subscriber added:",
        normalizedEmail
      );

      try {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Newsletter Subscription</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 15px;">

      <table
        width="600"
        cellpadding="0"
        cellspacing="0"
        style="
          max-width:600px;
          width:100%;
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
        "
      >

        <tr>
          <td style="
            background:#111827;
            padding:28px 30px;
          ">

            <div style="
              font-size:26px;
              font-weight:bold;
              color:#ffffff;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

            <div style="
              font-size:13px;
              color:#aeb5c2;
              margin-top:5px;
            ">
              Your trusted online store
            </div>

          </td>
        </tr>

        <tr>
          <td style="padding:35px 30px;">

            <h1 style="
              margin:0 0 15px;
              font-size:24px;
              color:#111827;
            ">
              You're Subscribed! 🎉
            </h1>

            <p style="
              font-size:15px;
              color:#444444;
              line-height:1.7;
            ">
              Thank you for subscribing to the
              ShopHub newsletter.
            </p>

            <p style="
              font-size:15px;
              color:#666666;
              line-height:1.7;
            ">
              You'll now receive updates about new
              products, exclusive deals, and special offers.
            </p>

            <div style="
              margin:30px 0;
              padding:20px;
              background:#f5f7ff;
              border:1px solid #e0e7ff;
              border-radius:10px;
              text-align:center;
            ">

              <div style="
                font-size:13px;
                color:#777777;
                margin-bottom:8px;
              ">
                SUBSCRIBED EMAIL
              </div>

              <div style="
                font-size:16px;
                font-weight:bold;
                color:#4f46e5;
              ">
                ${normalizedEmail}
              </div>

            </div>

            <p style="
              font-size:14px;
              color:#777777;
              line-height:1.6;
            ">
              If you did not subscribe to this newsletter,
              you can safely ignore this email.
            </p>

          </td>
        </tr>

        <tr>
          <td style="
            background:#f9fafb;
            padding:25px 30px;
            text-align:center;
            border-top:1px solid #eeeeee;
          ">

            <div style="
              font-size:15px;
              font-weight:bold;
              color:#111827;
            ">
              Shop<span style="color:#6366f1;">Hub</span>
            </div>

            <p style="
              margin:8px 0;
              font-size:12px;
              color:#888888;
            ">
              Thank you for choosing ShopHub.
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

        await sendEmail(
          normalizedEmail,
          "Welcome to the ShopHub Newsletter",
          html
        );
      } catch (emailError) {
        console.error(
          "Newsletter confirmation email failed:",
          emailError
        );
      }

      res.status(201).json({
        message:
          "Thanks for subscribing! You are now subscribed to our newsletter.",

        subscriber: {
          id: subscriber._id,
          email: subscriber.email,
          subscribedAt:
            subscriber.subscribedAt,
        },
      });
    } catch (error) {
      console.error(
        "Newsletter subscription error:",
        error
      );

      if (error.code === 11000) {
        return res.status(400).json({
          message:
            "This email is already subscribed.",
        });
      }

      res.status(500).json({
        message:
          "Failed to subscribe. Please try again.",
      });
    }
  }
);


// GET NEWSLETTER SUBSCRIBERS
// ADMIN ONLY

app.get(
  "/api/newsletter/subscribers",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const subscribers =
        await Subscriber.find()
          .sort({
            createdAt: -1,
          })
          .select(
            "_id email subscribedAt createdAt"
          );

      res.json(subscribers);
    } catch (error) {
      console.error(
        "Get newsletter subscribers error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch newsletter subscribers.",
      });
    }
  }
);


// DELETE NEWSLETTER SUBSCRIBER
// ADMIN ONLY

app.delete(
  "/api/newsletter/subscribers/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const subscriber =
        await Subscriber.findByIdAndDelete(
          req.params.id
        );

      if (!subscriber) {
        return res.status(404).json({
          message:
            "Subscriber not found.",
        });
      }

      res.json({
        message:
          "Subscriber deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete subscriber error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete subscriber.",
      });
    }
  }
);


// =========================
// PUBLIC SETTINGS
// =========================

app.get(
  "/api/settings/public",
  async (req, res) => {
    try {
      let settings =
        await Setting.findOne();

      if (!settings) {
        settings =
          await Setting.create({
            storeName: "ShopHub",
            storeEmail:
              "support@shophub.com",
            currency: "USD",
            lowStockAlert: 10,
          });
      }

      res.json({
        storeName:
          settings.storeName,

        storeEmail:
          settings.storeEmail,

        currency:
          settings.currency,
      });
    } catch (error) {
      console.error(
        "Get public settings error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch store settings.",
      });
    }
  }
);


// =========================
// SETTINGS
// =========================


// GET SETTINGS
// ADMIN ONLY

app.get(
  "/api/settings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      let settings =
        await Setting.findOne();

      if (!settings) {
        settings =
          await Setting.create({
            storeName: "ShopHub",
            storeEmail:
              "support@shophub.com",
            currency: "USD",
            lowStockAlert: 10,
          });
      }

      res.json(settings);
    } catch (error) {
      console.error(
        "Get settings error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch settings.",
      });
    }
  }
);


// UPDATE SETTINGS
// ADMIN ONLY

app.put(
  "/api/settings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        storeName,
        storeEmail,
        currency,
        lowStockAlert,
      } = req.body;

      if (!storeName?.trim()) {
        return res.status(400).json({
          message:
            "Store name is required.",
        });
      }

      if (!storeEmail?.trim()) {
        return res.status(400).json({
          message:
            "Store email is required.",
        });
      }

      if (
        !["USD", "EUR", "PKR"].includes(
          currency
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid currency.",
        });
      }

      const stockAlert =
        Number(lowStockAlert);

      if (
        !Number.isInteger(stockAlert) ||
        stockAlert < 0
      ) {
        return res.status(400).json({
          message:
            "Low stock alert must be a valid number.",
        });
      }

      let settings =
        await Setting.findOne();

      if (!settings) {
        settings =
          new Setting();
      }

      settings.storeName =
        storeName.trim();

      settings.storeEmail =
        storeEmail.trim();

      settings.currency =
        currency;

      settings.lowStockAlert =
        stockAlert;

      await settings.save();

      res.json({
        message:
          "Settings saved successfully.",

        settings,
      });
    } catch (error) {
      console.error(
        "Update settings error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to save settings.",
      });
    }
  }
);


// =========================
// AUTH
// =========================


// REGISTER

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "All fields are required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "An account with this email already exists.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const verificationCode =
        generateVerificationCode();

      const verificationCodeExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      const user =
        new User({
          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role: "customer",

          isEmailVerified:
            false,

          verificationCode,

          verificationCodeExpires,
        });

      await user.save();

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>
<title>Verify Your ShopHub Account</title>
</head>

<body style="
margin:0;
padding:0;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 15px;">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
width:100%;
background:#ffffff;
border-radius:12px;
overflow:hidden;
"
>

<tr>
<td style="
background:#111827;
padding:28px 30px;
">

<div style="
font-size:26px;
font-weight:bold;
color:#ffffff;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<div style="
font-size:13px;
color:#aeb5c2;
margin-top:5px;
">
Your trusted online store
</div>

</td>
</tr>

<tr>
<td style="padding:35px 30px;">

<h1 style="
margin:0 0 15px;
font-size:24px;
color:#111827;
">
Verify Your Email
</h1>

<p style="
font-size:15px;
color:#444444;
line-height:1.7;
">
Hello ${firstName},
</p>

<p style="
font-size:15px;
color:#666666;
line-height:1.7;
">
Thank you for creating your ShopHub account.
Please use the verification code below to verify
your email address.
</p>

<div style="
margin:30px 0;
padding:25px;
background:#f5f7ff;
border:1px solid #e0e7ff;
border-radius:10px;
text-align:center;
">

<div style="
font-size:12px;
color:#777777;
margin-bottom:10px;
">
YOUR VERIFICATION CODE
</div>

<div style="
font-size:34px;
font-weight:bold;
letter-spacing:8px;
color:#4f46e5;
">
${verificationCode}
</div>

</div>

<p style="
font-size:14px;
color:#777777;
line-height:1.6;
">
This code will expire in
<strong>10 minutes</strong>.
</p>

<p style="
font-size:14px;
color:#777777;
line-height:1.6;
">
If you did not create this account,
you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td style="
background:#f9fafb;
padding:25px 30px;
text-align:center;
border-top:1px solid #eeeeee;
">

<div style="
font-size:15px;
font-weight:bold;
color:#111827;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<p style="
margin:8px 0;
font-size:12px;
color:#888888;
">
Thank you for choosing ShopHub.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

      let emailSent = false;

      try {
        await sendEmail(
          normalizedEmail,
          "Verify your ShopHub account",
          html
        );

        emailSent = true;
      } catch (emailError) {
        console.error(
          "Verification email failed:",
          emailError
        );
      }

      res.status(201).json({
        message:
          "Account created. Please verify your email.",

        emailSent,

        user: {
          id: user._id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          email:
            user.email,
          phone:
            user.phone || "",
          avatar:
            user.avatar || "",
          role:
            user.role,
          isEmailVerified:
            user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      res.status(500).json({
        message:
          "Something went wrong during registration.",
      });
    }
  }
);


// VERIFY EMAIL

app.post(
  "/api/auth/verify-email",
  async (req, res) => {
    try {
      const {
        email,
        code,
      } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          message:
            "Email and verification code are required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          message:
            "Email is already verified.",
        });
      }

      if (
        !user.verificationCode ||
        user.verificationCode !== code
      ) {
        return res.status(400).json({
          message:
            "Invalid verification code.",
        });
      }

      if (
        !user.verificationCodeExpires ||
        user.verificationCodeExpires <
          new Date()
      ) {
        return res.status(400).json({
          message:
            "Verification code has expired. Please request a new code.",
        });
      }

      user.isEmailVerified =
        true;

      user.verificationCode =
        null;

      user.verificationCodeExpires =
        null;

      await user.save();

      res.json({
        message:
          "Email verified successfully.",

        emailVerified: true,
      });
    } catch (error) {
      console.error(
        "Verify email error:",
        error
      );

      res.status(500).json({
        message:
          "Something went wrong during email verification.",
      });
    }
  }
);


// RESEND VERIFICATION CODE

app.post(
  "/api/auth/resend-code",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          message:
            "Email is already verified.",
        });
      }

      const verificationCode =
        generateVerificationCode();

      user.verificationCode =
        verificationCode;

      user.verificationCodeExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await user.save();

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>
<title>New ShopHub Verification Code</title>
</head>

<body style="
margin:0;
padding:0;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 15px;">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
width:100%;
background:#ffffff;
border-radius:12px;
overflow:hidden;
"
>

<tr>
<td style="
background:#111827;
padding:28px 30px;
">

<div style="
font-size:26px;
font-weight:bold;
color:#ffffff;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<div style="
font-size:13px;
color:#aeb5c2;
margin-top:5px;
">
Your trusted online store
</div>

</td>
</tr>

<tr>
<td style="padding:35px 30px;">

<h1 style="
margin:0 0 15px;
font-size:24px;
color:#111827;
">
New Verification Code
</h1>

<p style="
font-size:15px;
color:#666666;
line-height:1.7;
">
Here is your new ShopHub verification code.
</p>

<div style="
margin:30px 0;
padding:25px;
background:#f5f7ff;
border:1px solid #e0e7ff;
border-radius:10px;
text-align:center;
">

<div style="
font-size:12px;
color:#777777;
margin-bottom:10px;
">
VERIFICATION CODE
</div>

<div style="
font-size:34px;
font-weight:bold;
letter-spacing:8px;
color:#4f46e5;
">
${verificationCode}
</div>

</div>

<p style="
font-size:14px;
color:#777777;
">
This code will expire in
<strong>10 minutes</strong>.
</p>

</td>
</tr>

<tr>
<td style="
background:#f9fafb;
padding:25px 30px;
text-align:center;
">

<div style="
font-size:15px;
font-weight:bold;
color:#111827;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

      await sendEmail(
        normalizedEmail,
        "Your new ShopHub verification code",
        html
      );

      res.json({
        message:
          "A new verification code has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend code error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send verification code.",
      });
    }
  }
);


// FORGOT PASSWORD

app.post(
  "/api/auth/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.json({
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      const resetToken =
        generateResetToken();

      const resetTokenExpires =
        new Date(
          Date.now() +
            15 * 60 * 1000
        );

      user.resetPasswordToken =
        resetToken;

      user.resetPasswordExpires =
        resetTokenExpires;

      await user.save();

      const resetUrl =
        `http://localhost:5173/reset-password?token=${resetToken}`;

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>
<title>Reset Your ShopHub Password</title>
</head>

<body style="
margin:0;
padding:0;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
<td align="center" style="padding:40px 15px;">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
width:100%;
background:#ffffff;
border-radius:12px;
overflow:hidden;
"
>

<tr>
<td style="
background:#111827;
padding:28px 30px;
">

<div style="
font-size:26px;
font-weight:bold;
color:#ffffff;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<div style="
font-size:13px;
color:#aeb5c2;
margin-top:5px;
">
Your trusted online store
</div>

</td>
</tr>

<tr>
<td style="padding:35px 30px;">

<h1 style="
margin:0 0 15px;
font-size:24px;
color:#111827;
">
Reset Your Password
</h1>

<p style="
font-size:15px;
color:#444444;
line-height:1.7;
">
Hello ${user.firstName || "Customer"},
</p>

<p style="
font-size:15px;
color:#666666;
line-height:1.7;
">
We received a request to reset the password
for your ShopHub account.
Click the button below to create a new password.
</p>

<div style="
text-align:center;
margin:30px 0;
">

<a
href="${resetUrl}"
style="
display:inline-block;
background:#4f46e5;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:8px;
font-size:15px;
font-weight:bold;
"
>
Reset Password
</a>

</div>

<p style="
font-size:14px;
color:#777777;
line-height:1.6;
">
This password reset link will expire in
<strong>15 minutes</strong>.
</p>

<p style="
font-size:14px;
color:#777777;
line-height:1.6;
">
If you did not request a password reset,
you can safely ignore this email.
Your password will remain unchanged.
</p>

</td>
</tr>

<tr>
<td style="
background:#f9fafb;
padding:25px 30px;
text-align:center;
border-top:1px solid #eeeeee;
">

<div style="
font-size:15px;
font-weight:bold;
color:#111827;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<p style="
margin:8px 0;
font-size:12px;
color:#888888;
">
Thank you for choosing ShopHub.
</p>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`;

      try {
        await sendEmail(
          normalizedEmail,
          "Reset your ShopHub password",
          html
        );
      } catch (emailError) {
        console.error(
          "Password reset email failed:",
          emailError
        );

        user.resetPasswordToken =
          null;

        user.resetPasswordExpires =
          null;

        await user.save();

        return res.status(500).json({
          message:
            "Failed to send password reset email.",
        });
      }

      res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      res.status(500).json({
        message:
          "Something went wrong. Please try again.",
      });
    }
  }
);


// RESET PASSWORD

app.post(
  "/api/auth/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        password,
      } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message:
            "Reset token and password are required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters.",
        });
      }

      const user =
        await User.findOne({
          resetPasswordToken: token,

          resetPasswordExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired password reset link.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      user.password =
        hashedPassword;

      user.resetPasswordToken =
        null;

      user.resetPasswordExpires =
        null;

      await user.save();

      res.json({
        message:
          "Password reset successfully. You can now login.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        message:
          "Something went wrong while resetting your password.",
      });
    }
  }
);


// LOGIN

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          message:
            "Please verify your email before logging in.",

          emailVerified: false,
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const token =
        generateToken(user);

      res.json({
        message:
          "Login successful.",

        token,

        user: {
          id: user._id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          email:
            user.email,
          phone:
            user.phone || "",
          avatar:
            user.avatar || "",
          role:
            user.role,
          isEmailVerified:
            user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        message:
          "Something went wrong during login.",
      });
    }
  }
);


// GET ALL USERS
// ADMIN ONLY

app.get(
  "/api/auth/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select(
            "-password -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires"
          )
          .sort({
            createdAt: -1,
          });

      const usersWithStats =
        await Promise.all(
          users.map(
            async (user) => {
              const orders =
                await Order.find({
                  "customer.email":
                    user.email,
                });

              const ordersCount =
                orders.length;

              const totalSpent =
                orders.reduce(
                  (
                    sum,
                    order
                  ) =>
                    sum +
                    Number(
                      order.total ||
                        0
                    ),
                  0
                );

              return {
                _id: user._id,

                firstName:
                  user.firstName ||
                  "",

                lastName:
                  user.lastName ||
                  "",

                email:
                  user.email ||
                  "",

                phone:
                  user.phone ||
                  "",

                avatar:
                  user.avatar ||
                  "",

                role:
                  user.role ||
                  "customer",

                isEmailVerified:
                  user.isEmailVerified ||
                  false,

                status:
                  "Active",

                ordersCount,

                totalSpent,
              };
            }
          )
        );

      res.json(
        usersWithStats
      );
    } catch (error) {
      console.error(
        "Get users error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch users.",
      });
    }
  }
);


// CHANGE PASSWORD

app.put(
  "/api/auth/change-password",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      const userId =
        req.user.id;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "All password fields are required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            "Current password is incorrect.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      res.json({
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to change password.",
      });
    }
  }
);


// =========================
// CATEGORIES
// =========================


// GET ALL CATEGORIES
// PUBLIC

app.get(
  "/api/categories",
  async (req, res) => {
    try {
      const categories =
        await Category.find().sort({
          createdAt: -1,
        });

      const categoriesWithStats =
        await Promise.all(
          categories.map(
            async (category) => {
              const productCount =
                await Product.countDocuments({
                  category:
                    category._id.toString(),
                });

              return {
                _id:
                  category._id,

                id:
                  category._id,

                name:
                  category.name,

                description:
                  category.description ||
                  "",

                image:
                  category.image ||
                  "",

                status:
                  category.status ||
                  "Active",

                productCount,
              };
            }
          )
        );

      res.json(
        categoriesWithStats
      );
    } catch (error) {
      console.error(
        "Get categories error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch categories.",
      });
    }
  }
);


// CREATE CATEGORY
// ADMIN ONLY

app.post(
  "/api/categories",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        description,
        image,
        status,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message:
            "Category name is required.",
        });
      }

      const existingCategory =
        await Category.findOne({
          name:
            name.trim(),
        });

      if (existingCategory) {
        return res.status(400).json({
          message:
            "Category already exists.",
        });
      }

      const category =
        new Category({
          name:
            name.trim(),

          description:
            description || "",

          image:
            image || "",

          status:
            status || "Active",
        });

      await category.save();

      res.status(201).json({
        _id:
          category._id,

        id:
          category._id,

        name:
          category.name,

        description:
          category.description,

        image:
          category.image,

        status:
          category.status,

        productCount:
          0,
      });
    } catch (error) {
      console.error(
        "Create category error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create category.",
      });
    }
  }
);


// UPDATE CATEGORY
// ADMIN ONLY

app.put(
  "/api/categories/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        description,
        image,
        status,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message:
            "Category name is required.",
        });
      }

      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found.",
        });
      }

      const duplicate =
        await Category.findOne({
          name:
            name.trim(),

          _id: {
            $ne:
              req.params.id,
          },
        });

      if (duplicate) {
        return res.status(400).json({
          message:
            "Another category with this name already exists.",
        });
      }

      category.name =
        name.trim();

      category.description =
        description || "";

      category.image =
        image || "";

      category.status =
        status || "Active";

      await category.save();

      const productCount =
        await Product.countDocuments({
          category:
            category._id.toString(),
        });

      res.json({
        _id:
          category._id,

        id:
          category._id,

        name:
          category.name,

        description:
          category.description,

        image:
          category.image,

        status:
          category.status,

        productCount,
      });
    } catch (error) {
      console.error(
        "Update category error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update category.",
      });
    }
  }
);


// DELETE CATEGORY
// ADMIN ONLY

app.delete(
  "/api/categories/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found.",
        });
      }

      const productCount =
        await Product.countDocuments({
          category:
            category._id.toString(),
        });

      if (productCount > 0) {
        return res.status(400).json({
          message:
            "Cannot delete a category that has products.",
        });
      }

      await Category.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Category deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete category.",
      });
    }
  }
);


// =========================
// PRODUCTS
// =========================


// GET ALL PRODUCTS
// PUBLIC

app.get(
  "/api/products",
  async (req, res) => {
    try {
      const products =
        await Product.find();

      res.json(products);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch products.",
      });
    }
  }
);


// GET SINGLE PRODUCT
// PUBLIC

app.get(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      res.json(product);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch product.",
      });
    }
  }
);


// CREATE PRODUCT
// ADMIN ONLY

app.post(
  "/api/products",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        price,
        description,
        category,
        stock,
      } = req.body;

      const product =
        new Product({
          name,

          price:
            Number(price),

          description,

          category,

          stock:
            Number(stock),

          image:
            req.file
              ? `/uploads/${req.file.filename}`
              : "",
        });

      await product.save();

      res.status(201).json(
        product
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to create product.",
      });
    }
  }
);


// UPDATE PRODUCT
// ADMIN ONLY

app.put(
  "/api/products/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      const {
        name,
        price,
        description,
        category,
        stock,
      } = req.body;

      product.name =
        name;

      product.price =
        Number(price);

      product.description =
        description;

      product.category =
        category;

      product.stock =
        Number(stock);

      if (req.file) {
        if (product.image) {
          const oldImagePath =
            path.join(
              __dirname,
              product.image.replace(
                "/uploads/",
                "uploads/"
              )
            );

          if (
            fs.existsSync(
              oldImagePath
            )
          ) {
            fs.unlinkSync(
              oldImagePath
            );
          }
        }

        product.image =
          `/uploads/${req.file.filename}`;
      }

      await product.save();

      res.json(
        product
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update product.",
      });
    }
  }
);


// DELETE PRODUCT
// ADMIN ONLY

app.delete(
  "/api/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      if (product.image) {
        const imagePath =
          path.join(
            __dirname,
            product.image.replace(
              "/uploads/",
              "uploads/"
            )
          );

        if (
          fs.existsSync(
            imagePath
          )
        ) {
          fs.unlinkSync(
            imagePath
          );
        }
      }

      await Product.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Product deleted successfully.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete product.",
      });
    }
  }
);


// =========================
// ORDERS
// =========================


// CREATE ORDER
// CUSTOMER


app.post(
  "/api/orders",
  async (req, res) => {
    try {
      const orderData =
        req.body;

      const order =
        new Order(
          orderData
        );

      await order.save();


      // =========================
      // ADMIN EMAIL
      // =========================

      try {
        const adminHtml =
          createEmailTemplate({
            title:
              "New Order Received",

            greeting:
              "A new order has been placed.",

            message:
              "A customer has successfully placed a new order on ShopHub.",

            status:
              "New Order",

            statusColor:
              "#4f46e5",

            orderId:
              order._id,

            customer:
              order.customer,

            items:
              order.items,

            subtotal:
              order.subtotal,

            delivery:
              order.delivery,

            tax:
              order.tax,

            total:
              order.total,

            paymentMethod:
              order.paymentMethod,

            deliveryMethod:
              order.deliveryMethod,

            isAdmin:
              true,
          });

        await sendEmail(
          process.env.ADMIN_EMAIL,
          `New ShopHub Order #${order._id}`,
          adminHtml
        );
      } catch (emailError) {
        console.error(
          "Admin email error:",
          emailError
        );
      }


      // =========================
      // CUSTOMER EMAIL
      // =========================

      try {
        const customerHtml =
          createEmailTemplate({
            title:
              "Order Confirmed",

            greeting:
              `Hello ${
                order.customer.firstName ||
                "Customer"
              },`,

            message:
              "Thank you for your order. We have received your order successfully.",

            status:
              "Pending",

            statusColor:
              "#f59e0b",

            orderId:
              order._id,

            customer:
              order.customer,

            items:
              order.items,

            subtotal:
              order.subtotal,

            delivery:
              order.delivery,

            tax:
              order.tax,

            total:
              order.total,

            paymentMethod:
              order.paymentMethod,

            deliveryMethod:
              order.deliveryMethod,
          });

        await sendEmail(
          order.customer.email,
          `ShopHub Order Confirmation #${order._id}`,
          customerHtml
        );
      } catch (emailError) {
        console.error(
          "Customer email error:",
          emailError
        );
      }

      res.status(201).json({
        message:
          "Order created successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create order.",
      });
    }
  }
);


// GET ALL ORDERS
// ADMIN ONLY

app.get(
  "/api/orders",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders =
        await Order.find().sort({
          createdAt: -1,
        });

      res.json(orders);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch orders.",
      });
    }
  }
);


// GET SINGLE ORDER
// AUTHENTICATED

app.get(
  "/api/orders/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      if (
        req.user.role === "admin"
      ) {
        return res.json(
          order
        );
      }

      if (
        !order.customer ||
        order.customer.email !==
          req.user.email
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to view this order.",
        });
      }

      res.json(
        order
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch order.",
      });
    }
  }
);


// UPDATE ORDER STATUS
// ADMIN ONLY

app.put(
  "/api/orders/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        status,
        note,
      } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found.",
        });
      }

      const oldStatus =
        order.status;

      order.status =
        status;

      if (note !== undefined) {
        order.note =
          note;
      }

      await order.save();


      // =========================
      // SEND STATUS EMAIL
      // =========================

      if (
        oldStatus !== status &&
        order.customer &&
        order.customer.email
      ) {
        try {
          let statusColor =
            "#4f46e5";

          if (
            status.toLowerCase() ===
            "pending"
          ) {
            statusColor =
              "#f59e0b";
          }

          if (
            status.toLowerCase() ===
            "processing"
          ) {
            statusColor =
              "#3b82f6";
          }

          if (
            status.toLowerCase() ===
            "shipped"
          ) {
            statusColor =
              "#8b5cf6";
          }

          if (
            status.toLowerCase() ===
            "delivered"
          ) {
            statusColor =
              "#16a34a";
          }

          if (
            status.toLowerCase() ===
            "cancelled"
          ) {
            statusColor =
              "#dc2626";
          }

          const customerHtml =
            createEmailTemplate({
              title:
                status.toLowerCase() ===
                "cancelled"
                  ? "Order Cancelled"
                  : "Order Status Updated",

              greeting:
                `Hello ${
                  order.customer.firstName ||
                  "Customer"
                },`,

              message:
                status.toLowerCase() ===
                "cancelled"
                  ? "Unfortunately, your order has been cancelled."
                  : `Your ShopHub order status has been updated to ${status}.`,

              status,

              statusColor,

              orderId:
                order._id,

              customer:
                order.customer,

              items:
                order.items,

              subtotal:
                order.subtotal,

              delivery:
                order.delivery,

              tax:
                order.tax,

              total:
                order.total,

              paymentMethod:
                order.paymentMethod,

              deliveryMethod:
                order.deliveryMethod,

              cancellationReason:
                status.toLowerCase() ===
                "cancelled"
                  ? order.note
                  : "",
            });

          await sendEmail(
            order.customer.email,
            `ShopHub Order Update #${order._id}`,
            customerHtml
          );
        } catch (emailError) {
          console.error(
            "Status email error:",
            emailError
          );
        }
      }

      res.json({
        message:
          "Order updated successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Update order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update order.",
      });
    }
  }
);


// =========================
// REVIEWS
// =========================


// TEST REVIEWS ROUTE

app.get(
  "/api/reviews-test",
  (req, res) => {
    console.log(
      "GET /api/reviews-test reached"
    );

    res.json({
      message:
        "Reviews route is working!",
    });
  }
);


// GET REVIEWS FOR PRODUCT

app.get(
  "/api/reviews/:productId",
  async (req, res) => {
    console.log(
      "GET /api/reviews reached:",
      req.params.productId
    );

    try {
      const {
        productId,
      } = req.params;

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      const reviews =
        await Review.find({
          productId,
        }).sort({
          createdAt: -1,
        });

      res.json(
        reviews
      );
    } catch (error) {
      console.error(
        "Get reviews error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch reviews.",
      });
    }
  }
);


// CREATE REVIEW

app.post(
  "/api/reviews",
  async (req, res) => {
    console.log(
      "POST /api/reviews reached"
    );

    try {
      const {
        productId,
        userId,
        rating,
        text,
      } = req.body;

      if (
        !productId ||
        !userId ||
        rating === undefined ||
        !text
      ) {
        return res.status(400).json({
          message:
            "Product, user, rating and review text are required.",
        });
      }

      const reviewRating =
        Number(rating);

      if (
        !Number.isInteger(
          reviewRating
        ) ||
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5.",
        });
      }

      const reviewText =
        text.trim();

      if (!reviewText) {
        return res.status(400).json({
          message:
            "Review text is required.",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          message:
            "Please verify your email before submitting a review.",
        });
      }

      const deliveredOrder =
        await Order.findOne({
          "customer.email":
            user.email,

          status: {
            $regex:
              /^delivered$/i,
          },

          items: {
            $elemMatch: {
              productId:
                productId,
            },
          },
        });

      if (!deliveredOrder) {
        return res.status(403).json({
          message:
            "You can only review products from delivered orders.",
        });
      }

      const existingReview =
        await Review.findOne({
          productId,
          userId,
        });

      if (existingReview) {
        return res.status(400).json({
          message:
            "You have already reviewed this product.",
        });
      }

      const review =
        new Review({
          productId,

          userId,

          customerName:
            `${user.firstName} ${user.lastName}`.trim(),

          rating:
            reviewRating,

          text:
            reviewText,
        });

      await review.save();

      const allReviews =
        await Review.find({
          productId,
        });

      const totalRating =
        allReviews.reduce(
          (
            sum,
            currentReview
          ) =>
            sum +
            Number(
              currentReview.rating
            ),
          0
        );

      const averageRating =
        allReviews.length > 0
          ? totalRating /
            allReviews.length
          : 0;

      product.rating =
        Number(
          averageRating.toFixed(1)
        );

      product.reviews =
        allReviews.length;

      await product.save();

      res.status(201).json({
        message:
          "Review submitted successfully.",

        review,

        rating:
          product.rating,

        reviews:
          product.reviews,
      });
    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to submit review.",
      });
    }
  }
);


// =========================
// TEST EMAIL
// =========================

app.get(
  "/api/test-email",
  async (req, res) => {
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "ShopHub Test Email",
        `
          <h1>ShopHub Email Test</h1>
          <p>Email system is working correctly.</p>
        `
      );

      res.json({
        message:
          "Test email sent successfully.",
      });
    } catch (error) {
      console.error(
        "Test email error:",
        error
      );

      res.status(500).json({
        message:
          "Test email failed.",
      });
    }
  }
);


// =========================
// UPDATE CUSTOMER PROFILE
// =========================

app.put(
  "/api/auth/profile",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        phone,
      } = req.body;

      const userId =
        req.user.id;

      console.log(
        "PROFILE UPDATE REQUEST:",
        userId
      );

      if (!firstName?.trim()) {
        return res.status(400).json({
          message:
            "First name is required.",
        });
      }

      if (!lastName?.trim()) {
        return res.status(400).json({
          message:
            "Last name is required.",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      user.firstName =
        firstName.trim();

      user.lastName =
        lastName.trim();

      user.phone =
        phone?.trim() || "";

      if (req.file) {
        if (user.avatar) {
          const oldAvatarPath =
            path.join(
              __dirname,
              "uploads",
              path.basename(
                user.avatar
              )
            );

          if (
            fs.existsSync(
              oldAvatarPath
            )
          ) {
            fs.unlinkSync(
              oldAvatarPath
            );
          }
        }

        user.avatar =
          `/uploads/${req.file.filename}`;
      }

      await user.save();

      res.json({
        message:
          "Profile updated successfully.",

        user: {
          id:
            user._id,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          email:
            user.email,

          phone:
            user.phone || "",

          avatar:
            user.avatar || "",

          role:
            user.role,

          isEmailVerified:
            user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update profile.",
      });
    }
  }
);

app.get(
  "/api/stripe/verify-session/:sessionId",
  authMiddleware,
  async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId
      );

      if (!session) {
        return res.status(404).json({
          message: "Stripe session not found.",
        });
      }

      if (
        session.metadata?.userId !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          message: "This payment does not belong to you.",
        });
      }

      res.json({
        paid: session.payment_status === "paid",
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
    } catch (error) {
      console.error(
        "Stripe session verification error:",
        error
      );

      res.status(500).json({
        message: "Unable to verify Stripe session.",
      });
    }
  }
);
app.post(
  "/api/stripe/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        customer,
        items,
        subtotal,
        delivery,
        tax,
        total,
        deliveryMethod,
      } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],

        mode: "payment",

        customer_email: customer.email,

        line_items: items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(Number(item.price) * 100),
          },
          quantity: Number(item.quantity),
        })),

        metadata: {
          userId: req.user.id.toString(),
          email: customer.email,
          deliveryMethod: deliveryMethod || "standard",
          subtotal: String(subtotal),
          delivery: String(delivery),
          tax: String(tax),
          total: String(total),
        },

        success_url:
          "http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}",

        cancel_url:
          "http://localhost:5173/checkout",
      });

      res.json({
        url: session.url,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);

      res.status(500).json({
        message: "Unable to create Stripe checkout session.",
      });
    }
  }
);
// =========================
// MONGODB
// =========================

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/ecommerce"
  )
  .then(() => {
    console.log(
      "MongoDB connected"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });


// =========================
// ROOT
// =========================

app.get(
  "/",
  (req, res) => {
    res.send(
      "ShopHub API is running"
    );
  }
);


// =========================
// START SERVER
// =========================

console.log(
  "SERVER FILE:",
  __filename
);

console.log(
  "REVIEW ROUTES LOADED"
);

console.log(
  "PROFILE ROUTE REGISTERED: /api/auth/profile"
);

console.log(
  "ADMIN AUTH MIDDLEWARE LOADED"
);

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);