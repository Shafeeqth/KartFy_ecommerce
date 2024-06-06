

const otpTemplate = (otp, name) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
	
			.highlight {
				font-weight: bold;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<a href="http://${process.env.ORIGIN_URL}/api/v1"><img class="logo"
					src="https://img.atom.com/story_images/visual_images/1612609471-kafty.png?class=show" alt="KartFy Logo"></a>
			<div class="message">OTP Verification Email</div>
			<div class="body">
				<p>Dear ${name}</p>
				<p>Thank you for registering with KartFy. To complete your registration, please use the following OTP
					(One-Time Password) to verify your account:</p>
				<h2 class="highlight"> ${otp}</h2>
				<p>This OTP is valid for 3 minutes. If you did not request this verification, please disregard this email.
				Once your account is verified, you will have access to our Website and its features.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
					href="mailto:shafeeqsha06@gmail.com">CartFy Officails</a>. We are here to help!</div>
		</div>
	</body>
	
	</html>`;
};

const passwordUpdated = (Token, name) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Update Confirmation</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="http://${process.env.ORIGIN_URL}/api/v1"><img class="logo"
			src="https://img.atom.com/story_images/visual_images/1612609471-kafty.png?class=show" alt="KartFy Logo"></a>
            <div class="message">Reset Password Confirmation</div>
            <div class="body">
			<p>Dear ${name}</p>
			<p>Thank you for working with KartFy. To complete your transacton, please use the following link
				 to change  your account password:</p>
			<h2 class="highlight"> Press <a href=http://${process.env.ORIGIN_URL}/api/v1/reset-password?token=${Token}> here </a> to Reset your password</h2>
			<p>This link is valid only for 3 minutes. If you did not request this verification, please disregard this email.
			If the link got expired please try the process you have done. Thank you </p>
            </div>
            <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                at
                <a href="mailto:shafeeqsha06@gmail.com">CartFy Officails</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
};


module.exports = {
	otpTemplate,
	passwordUpdated

}