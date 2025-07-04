document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('volunteerForm');
    const responseMessage = document.getElementById('responseMessage');
  
    form.addEventListener('submit', function (event) {
      event.preventDefault();
  
      // Clear messages
      responseMessage.textContent = '';
      ['nameError', 'emailError', 'locationError', 'availabilityError'].forEach(id => {
        document.getElementById(id).textContent = '';
      });
  
      // Get values
      const fullName = form.fullName.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const location = form.location.value.trim();
      const skills = form.skills.value.trim();
      const availability = form.availability.value;
  
      // Validate
      let valid = true;
  
      if (fullName.length < 2) {
        document.getElementById('nameError').textContent = 'Please enter your full name.';
        valid = false;
      }
  
      if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        valid = false;
      }
  
      if (location.length < 2) {
        document.getElementById('locationError').textContent = 'Please enter your location.';
        valid = false;
      }
  
      if (!availability) {
        document.getElementById('availabilityError').textContent = 'Please select your availability.';
        valid = false;
      }
  
      if (!valid) return;
  
      // Submit success message
      responseMessage.textContent = `Thank you, ${fullName}! Your volunteer registration has been received. We’ll be in touch soon.`;
  
      // Reset form
      form.reset();
  
      // Optional: Store locally
      // const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
      // volunteers.push({ fullName, email, phone, location, skills, availability, date: new Date() });
      // localStorage.setItem('volunteers', JSON.stringify(volunteers));
    });
  
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  });
  document.addEventListener('DOMContentLoaded', function () {
    const link = encodeURIComponent("https://www.gofundme.com/f/save-the-rwenzoris");
    const text = encodeURIComponent("🌍 Help us save the Rwenzori Mountains from climate disaster. Donate or share this campaign!");
  
    // Populate share links
    document.getElementById('facebookShare').href = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
    document.getElementById('twitterShare').href = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
    document.getElementById('whatsappShare').href = `https://api.whatsapp.com/send?text=${text}%20${link}`;
  });
  
  function copyLink() {
    const input = document.getElementById("campaignLink");
    input.select();
    input.setSelectionRange(0, 99999); // for mobile
    document.execCommand("copy");
  
    const message = document.getElementById("copyMessage");
    message.textContent = "✅ Link copied!";
    setTimeout(() => message.textContent = "", 3000);
  }
  