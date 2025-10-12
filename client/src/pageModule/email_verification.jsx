import React, { useEffect, useState } from 'react';
import './login.css';
import './register.css';

async function sendVerifyCode(Recipient, functionParam, vcode, setButtonText, setCountdown) {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    try {
        const from = 'nu'; // Replace with the actual from
        
        const response = await fetch(`${apiUrl}/api/sendVerifyCode`, {
            method: 'POST', // Specify the method
            headers: {
                'Content-Type': 'application/json', // Set the content type
            },
            body: JSON.stringify({ Recipient, functionParam, from, vcode }), // Include the email and function in the body
            credentials: 'include', // Include cookies
        });
        if (!response.ok) {
            const errorData = await response.json(); // Parse the response body as JSON
            throw new Error(errorData.message);
        }
        const data = await response.json();
        if (data.message === "codeSent") { // Email (Verification code has been sent.)
            document.getElementById('emailLbl').textContent = "Email: " + data.email + ", Verification code has been sent." + data.resData;
            setCountdown(60);
            setButtonText('Resend in 60s');
        } else if (data.message === "emailExists") {
            document.getElementById('emailLbl').textContent = "Email (Email exists, please try again.)";
        } else {
            document.getElementById('emailLbl').textContent = data.message;
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation: ', error);
    }
}

async function verifyEmail(Recipient, functionParam, vcode) {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    try {
        const response = await fetch(`${apiUrl}/api/verifyEmail`, {
            method: 'POST', // Specify the method
            headers: {
                'Content-Type': 'application/json', // Set the content type
            },
            body: JSON.stringify({ Recipient, functionParam, vcode }), // Include the email and function in the body
            credentials: 'include', // Include cookies
        });
        if (!response.ok) {
            const errorData = await response.json(); // Parse the response body as JSON
            throw new Error(errorData.message);
        }
        const data = await response.json();
        document.getElementById('codeLbl').textContent = data.message;
    } catch (error) {
        console.error('There has been a problem with your fetch operation: ', error);
    }
}

function EmailVerification() {

    const [emailVerify, startEmailVerify] = useState(false);
    const [Recipient, setRecipients] = useState("");
    const [vcode, setVcode] = useState("");
    const [countdown, setCountdown] = useState(null);
    const [buttonText, setButtonText] = useState('Send');

    useEffect(() => {
        var functionParam;
        if (emailVerify === 'sendvcode') {
            document.getElementById('emailLbl').value = "Email (Sending...)";
            functionParam = "send_verification_code";
            sendVerifyCode(Recipient, functionParam, vcode, setButtonText, setCountdown);
            startEmailVerify(false);

        } else if (emailVerify === 'verify') {
            functionParam = 'email_verification';
            verifyEmail(Recipient, functionParam, vcode);
            startEmailVerify(false);
        }
    }, [emailVerify, Recipient, vcode]);

    useEffect(() => {
        let intervalId;

        if (countdown > 0) {
            intervalId = setInterval(() => {
                setCountdown(countdown => countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setButtonText('Send');
        }

        return () => clearInterval(intervalId);
    }, [countdown]);

    return (
        <form method="post">
            <div style={{ textAlign: "center" }}>
                <p>If you want to add or change the email, you should finish the
                    following Verification.</p>
            </div>
            <label htmlFor="userEmail" id="emailLbl">Email</label>
            <input type="email" id="userEmail" name="userEmail" required onChange={e => setRecipients(e.target.value)} />

            <label htmlFor="vcode" id="codeLbl">Verification code</label>
            <input type="text" id="vcode" name="vcode" required onChange={e => setVcode(e.target.value)} />

            <button type="button" id="sendButton" className="btn" onClick={() => startEmailVerify("sendvcode")}>{countdown > 0 ? `Resend in ${countdown}s` : buttonText}</button>
            <button type="button" id="v" className="btn" onClick={() => startEmailVerify("verify")}>Verify</button>
        </form>
    );
}

export default EmailVerification;