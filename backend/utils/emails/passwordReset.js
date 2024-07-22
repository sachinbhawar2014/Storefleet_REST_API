import nodemailer from "nodemailer";

// storefleet2k23@gmail.com   ubdfspvwnqkayrxr
export const sendPasswordResetEmail = async (user, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.STORFLEET_SMPT_MAIL,
        pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.STORFLEET_SMPT_MAIL,
      to: user.email,
      subject: "Password Reset",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
            /* Add your custom CSS styles here */
            body {
                font-family: Arial, sans-serif;
                
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                
                color: #4c004c;
                font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
            }
            .header {
                text-align: center;
            }
            .logo {
                max-width: 150px;
            }
            .content {
                margin-top: 20px;
                text-align: center;
                color: #4c004c;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #20d49a;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            /* Mobile Responsive Styles */
            @media only screen and (max-width: 600px) {
                .container {
                padding: 10px;
                }
                .logo {
                max-width: 100px;
                }
                .button {
                display: block;
                margin-top: 10px;
                }
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <img class="logo" src="https://files.codingninjas.in/logo1-32230.png" alt="Storefleet Logo" />
                <h1>Password Reset</h1>
            </div>
            <div class="content">
                <p>Hello, ${user.name}</p>
                <p>
                Enter this token to complete the reset:  
                <p><b>${token}</b></p>
                </p>
                <p><a class="button" href="http://localhost:${process.env.PORT}/api/storefleet/users/password/reset/${token}">Reset Password</a></p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            </div>
        </body>
        </html>

    `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Error occured while working with send password reset mail", err.message);
  }
};
