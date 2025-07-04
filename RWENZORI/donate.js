import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFY9bcLKVCZbJQ50NuXmUNuWonWaMRXPc",
  authDomain: "savetherwenzori-48d45.firebaseapp.com",
  projectId: "savetherwenzori-48d45",
  storageBucket: "savetherwenzori-48d45.appspot.com",
  messagingSenderId: "147866594608",
  appId: "1:147866594608:web:7b838d12162d3370556cf5",
  measurementId: "G-9HB9QS5Q1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('donationForm');
    const messageBox = document.getElementById('donationMessage');
    const amountInput = document.getElementById('amount');
    const amountOptions = document.querySelectorAll('.amount-option');
    const paymentMethods = document.querySelectorAll('.method');
    const paymentInstructions = document.querySelectorAll('.payment-instructions');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const stripeContainer = document.getElementById('stripeContainer');
    const cardholderName = document.getElementById('cardholder-name');
    const cardholderEmail = document.getElementById('cardholder-email');
    const cardButton = document.getElementById('card-button');
    
    // Initialize Stripe with your publishable key
    const stripe = Stripe('pk_test_51PDX9hKjKqg8Gf7DcVW0sCJ0zFJZ9aYJ0rB2vXp0y2t6Y2X6s2q7tQ0dW4jz2o0d4Q1jZ3Kj5w7a5s9u7sF0z');
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                '::placeholder': {
                    color: '#aab7c4'
                }
            }
        }
    });
    
    cardElement.mount('#card-element');
    
    // Handle card validation errors
    cardElement.addEventListener('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle Payment Method Selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            
            const selectedMethod = method.dataset.method;
            showInstructions(selectedMethod);
            
            // Show/hide Stripe container
            if (selectedMethod === 'card') {
                stripeContainer.classList.add('active');
            } else {
                stripeContainer.classList.remove('active');
            }
        });
    });

    // Handle Amount Option Selection
    amountOptions.forEach(option => {
        option.addEventListener('click', () => {
            amountOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            const value = option.dataset.amount;
            amountInput.value = value;
        });
    });

    // Handle custom amount input changes
    amountInput.addEventListener('input', () => {
        // When user types a custom amount, remove active class from preset buttons
        amountOptions.forEach(o => o.classList.remove('active'));
        
        // Validate amount is positive
        if (parseFloat(amountInput.value) <= 0) {
            amountInput.setCustomValidity("Amount must be greater than 0");
        } else {
            amountInput.setCustomValidity("");
        }
    });

    // Handle Card Payment Button Click
    cardButton.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const amount = parseFloat(amountInput.value);
        
        if (!name) {
            showMessage("Please enter your name.", "error");
            nameInput.focus();
            return;
        }
        
        if (!email || !validateEmail(email)) {
            showMessage("Please enter a valid email address.", "error");
            emailInput.focus();
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            showMessage("Please enter a valid donation amount.", "error");
            amountInput.focus();
            return;
        }
        
        // Show processing message
        showMessage("Processing your payment...", "processing");
        
        try {
            // Store donation record in Firebase
            const donationRef = await addDoc(collection(db, 'donations'), {
                name: name,
                email: email,
                amount: amount,
                method: 'card',
                status: 'pending',
                timestamp: new Date()
            });
            
            // Create payment intent with your server (in a real implementation)
            // For demo purposes, we'll simulate a successful payment
            setTimeout(async () => {
                // In a real app, you would:
                // 1. Create a PaymentIntent on your server
                // 2. Confirm the card payment
                // 3. Handle the result
                
                // Simulate successful payment
                showMessage(`Thank you, ${name}! Your card payment of $${amount.toFixed(2)} was successful.`, "success");
                
                // Update donation record in Firebase
                await updateDoc(donationRef, {
                    status: 'completed',
                    transactionId: 'simulated_' + Math.random().toString(36).substring(7)
                });
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    form.reset();
                    amountOptions.forEach(o => o.classList.remove('active'));
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    paymentInstructions.forEach(instr => instr.classList.remove('active'));
                    stripeContainer.classList.remove('active');
                    messageBox.className = "message-box";
                    messageBox.style.display = "none";
                }, 5000);
            }, 2000);
        } catch (error) {
            console.error("Error processing donation:", error);
            showMessage("There was an error processing your payment. Please try again.", "error");
        }
    });

    // Handle Form Submission for other payment methods
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset message box
        messageBox.className = "message-box";
        messageBox.style.display = "none";
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const selectedMethodEl = document.querySelector('.method.selected');
        const paymentMethod = selectedMethodEl ? selectedMethodEl.dataset.method : null;
        
        // Enhanced validation
        if (!name) {
            showMessage("Please enter your name.", "error");
            nameInput.focus();
            return;
        }
        
        if (!email || !validateEmail(email)) {
            showMessage("Please enter a valid email address.", "error");
            emailInput.focus();
            return;
        }
        
        if (isNaN(amount)) {
            showMessage("Please enter a valid donation amount.", "error");
            amountInput.focus();
            return;
        }
        
        if (amount <= 0) {
            showMessage("Donation amount must be greater than 0.", "error");
            amountInput.focus();
            return;
        }
        
        if (!paymentMethod) {
            showMessage("Please select a payment method.", "error");
            return;
        }
        
        // Skip card processing (handled by separate button)
        if (paymentMethod === 'card') return;
        
        // Show processing message
        showMessage("Processing your donation...", "processing");
        
        try {
            // Store donation record in Firebase
            const donationRef = await addDoc(collection(db, 'donations'), {
                name: name,
                email: email,
                amount: amount,
                method: paymentMethod,
                status: 'pending',
                timestamp: new Date()
            });
            
            // Simulate payment processing based on method
            setTimeout(async () => {
                // Build and show success message
                let successMessage = `Thank you, ${name}! Your pledge of $${amount.toFixed(2)} has been received.`;
                
                switch (paymentMethod) {
                    case 'mobile':
                        successMessage += " Please complete your mobile money transfer using the instructions above.";
                        break;
                    case 'bank':
                        successMessage += " Please complete your bank transfer using the details provided.";
                        break;
                    case 'paypal':
                        successMessage += " You will be redirected to PayPal to complete your payment.";
                        setTimeout(() => {
                            window.open('https://www.paypal.com', '_blank');
                        }, 2000);
                        break;
                }
                
                showMessage(successMessage, "success");
                
                // Update donation record in Firebase
                await updateDoc(donationRef, {
                    status: 'pending_verification'
                });
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    form.reset();
                    amountOptions.forEach(o => o.classList.remove('active'));
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    paymentInstructions.forEach(instr => instr.classList.remove('active'));
                    stripeContainer.classList.remove('active');
                    messageBox.className = "message-box";
                    messageBox.style.display = "none";
                }, 5000);
            }, 1500);
        } catch (error) {
            console.error("Error processing donation:", error);
            showMessage("There was an error processing your donation. Please try again.", "error");
        }
    });

    // Show Payment Instructions
    function showInstructions(method) {
        paymentInstructions.forEach(instr => {
            instr.classList.remove('active');
            if (instr.dataset.method === method) {
                instr.classList.add('active');
            }
        });
    }

    // Message Box Handling
    function showMessage(message, type = 'success') {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = "block";
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Email validation function
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});