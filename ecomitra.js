// EcoMitra JS

document.addEventListener('DOMContentLoaded', () => {
  // --- Floating Leaves Animation ---
  const leavesContainer = document.querySelector('.leaves-container');
  if (leavesContainer) {
    const numberOfLeaves = 15;
    for (let i = 0; i < numberOfLeaves; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.style.left = `${Math.random() * 100}vw`;
      leaf.style.animationDelay = `${Math.random() * 15}s`;
      if (Math.random() > 0.5) {
        leaf.classList.add('fast');
      } else if (Math.random() > 0.2) {
        leaf.classList.add('slow');
      }
      leavesContainer.appendChild(leaf);
    }
  }

  // --- Voice Recognition & Waste Identification Logic ---
  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  const wasteDesc = document.getElementById('waste-desc');
  const askBtn = document.getElementById('ask-btn');
  const suggestionBox = document.getElementById('suggestion-box');
  const voiceLang = document.getElementById('voice-lang');

  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (voiceBtn) {
      voiceBtn.onclick = function() {
        recognition.lang = 'en-IN'; // Always use English for recognition, but detect Hindi from transcript
        recognition.start();
        voiceStatus.textContent = 'Listening...';
      };
      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('waste-desc').value = transcript;
        voiceStatus.textContent = 'Heard: ' + transcript;
        showSuggestion(transcript); // Only pass transcript, not recognition.lang
        setTimeout(() => { voiceStatus.textContent = ''; }, 3000);
      };
      recognition.onerror = function() {
        voiceStatus.textContent = 'Could not recognize. Try again.';
        setTimeout(() => { voiceStatus.textContent = ''; }, 2000);
      };
      recognition.onend = function() {
        voiceStatus.textContent = '';
      };
    }
  } else {
    voiceBtn.disabled = true;
    voiceStatus.textContent = 'Speech recognition not supported.';
  }

  function showSuggestion(desc) {
    if (!suggestionBox) return;
    let html = '';
    let ttsAnswers = [];
    // Detect language: guess from desc only
    let isHindi = /[\u0900-\u097F]/.test(desc) || /(kya|hai|ka|mein|aur|nahi|par|ke|se|ko|ki|ye|wo|hai|kaun|kyon|kaise|kab|kahan)/i.test(desc);
    const d = desc.toLowerCase();
    // Flexible keyword arrays
    const plasticWords = ['plastic', 'polythene', 'bottle', 'wrapper', 'packet', 'polybag', 'प्लास्टिक', 'पॉलीथिन', 'प्लास्टिक बोतल', 'प्लास्टिक रैपर', 'पॉलीबैग'];
    const bioWords = ['banana peel', 'egg shell', 'vegetable', 'fruit', 'food', 'leftover', 'peel', 'organic', 'biodegradable', 'केला', 'अंडा', 'सब्जी', 'फल', 'छिलका', 'खाना', 'बायोडिग्रेडेबल', 'जैविक'];
    const glassWords = ['glass', 'bottle', 'jar', 'कांच', 'शीशा', 'कांच की बोतल'];
    const paperWords = ['paper', 'newspaper', 'cardboard', 'carton', 'कागज', 'अखबार', 'कार्डबोर्ड', 'डिब्बा'];
    const metalWords = ['metal', 'iron', 'aluminium', 'steel', 'tin', 'can', 'foil', 'धातु', 'लोहा', 'एलुमिनियम', 'स्टील', 'टिन', 'डिब्बा', 'फॉइल'];
    const clothWords = ['cloth', 'fabric', 'old clothes', 'kapda', 'कपड़ा', 'कपड़े', 'पुराने कपड़े', 'कपड़ा', 'रुमाल'];
    const cowdungWords = ['cow dung', 'gobar', 'गोबर', 'animal dung', 'पशु गोबर'];
    const burnWords = ['burn', 'burning', 'जला', 'जलाना', 'आग', 'फूंकना'];
    // Helper for flexible matching
    function matchesAny(words) {
      return words.some(w => d.includes(w));
    }
    // Prompt for generic/unclear input
    if (d.trim() === '' || /^(what|ye|yaha|kya|hai|waste|कचरा|क्या|यह|ये|बताओ|help|सुझाव|advice|suggest|guide|गाइड|help me|मदद|सहायता|info|information|जानकारी|details|detail)$/i.test(d.trim())) {
      html = '<div style="color:#b71c1c;font-weight:500;">Please specify the waste item, e.g., "plastic bottle", "banana peel", "कांच", "कागज"...</div>';
      ttsAnswers = [];
    } else if (matchesAny(plasticWords)) {
      html = '<div><span style="font-size:2rem;">❌ ♻️</span><br><b>' + (isHindi ? 'नॉन-बायोडिग्रेडेबल' : 'Not Biodegradable') + '</b><br>' + (isHindi ? 'रीसायकल करें, जलाएं नहीं!' : 'Recyclable. Sellable. Do not burn!') + '</div>';
      ttsAnswers = isHindi ? [
        'यह प्लास्टिक कचरा है। यह बायोडिग्रेडेबल नहीं है। कृपया इसे रीसायकल के लिए अलग रखें।',
        'प्लास्टिक को रीसायकल करें, जलाएं नहीं। इसे कंपोस्ट से दूर रखें।',
        'प्लास्टिक कचरा इकट्ठा करें और कबाड़ी को दें।'
      ] : [
        'This is plastic waste. It is not biodegradable. Please store it separately for recycling.',
        'Plastic can be recycled. Do not burn it. Keep it away from compost.',
        'Collect plastic waste and give it to a recycler or kabadiwala.'
      ];
    } else if (matchesAny(bioWords)) {
      html = '<div><span style="font-size:2rem;">✅ 🌱</span><br><b>' + (isHindi ? 'बायोडिग्रेडेबल' : 'Biodegradable') + '</b><br>' + (isHindi ? 'कंपोस्ट के लिए उपयुक्त।' : 'Compost them for natural fertilizer!') + '</div>';
      ttsAnswers = isHindi ? [
        'यह बायोडिग्रेडेबल कचरा है। इसे कंपोस्ट करें।',
        'ऐसा किचन कचरा कंपोस्टिंग के लिए बहुत अच्छा है।',
        'इसे कंपोस्ट बिन में डालें, इससे मिट्टी उपजाऊ होगी।'
      ] : [
        'This is biodegradable waste. Compost it for natural fertilizer.',
        'Kitchen waste like this is great for composting.',
        'Add this to your compost bin to make healthy soil.'
      ];
    } else if (matchesAny(glassWords)) {
      html = '<div><span style="font-size:2rem;">♻️</span><br><b>' + (isHindi ? 'रीसायकल' : 'Recyclable') + '</b><br>' + (isHindi ? 'सावधानी से संभालें और कबाड़ी को दें।' : 'Handle with care and sell to scrap dealers.') + '</div>';
      ttsAnswers = isHindi ? [
        'यह कांच का कचरा है। इसे रीसायकल किया जा सकता है।',
        'कांच को सामान्य कचरे में न मिलाएं।',
        'कांच इकट्ठा करें और रीसायकल सेंटर को दें।'
      ] : [
        'This is glass waste. It is recyclable. Handle with care and sell to scrap dealers.',
        'Glass can be recycled. Do not mix with regular waste.',
        'Collect glass items and give them to a recycling center.'
      ];
    } else if (matchesAny(paperWords)) {
      html = '<div><span style="font-size:2rem;">♻️</span><br><b>' + (isHindi ? 'रीसायकल' : 'Recyclable') + '</b><br>' + (isHindi ? 'कागज को रीसायकल या दोबारा उपयोग करें।' : 'Recycle or upcycle into bags/crafts.') + '</div>';
      ttsAnswers = isHindi ? [
        'यह कागज का कचरा है। इसे रीसायकल करें या दोबारा उपयोग करें।',
        'कागज को सूखा रखें और रीसायकल के लिए अलग रखें।',
        'कागज को जलाएं नहीं, रीसायकल करें या क्राफ्ट में उपयोग करें।'
      ] : [
        'This is paper waste. It is recyclable. Recycle or upcycle it.',
        'Paper can be reused or recycled. Keep it dry for best results.',
        'Do not burn paper. Recycle it or use for crafts.'
      ];
    } else if (matchesAny(metalWords)) {
      html = '<div><span style="font-size:2rem;">♻️</span><br><b>' + (isHindi ? 'रीसायकल और बेचें' : 'Recyclable & Sellable') + '</b><br>' + (isHindi ? 'धातु इकट्ठा करें और कबाड़ी को बेचें।' : 'Collect and sell to scrap dealers.') + '</div>';
      ttsAnswers = isHindi ? [
        'यह धातु का कचरा है। इसे रीसायकल और बेचा जा सकता है।',
        'धातु को अलग रखें और कबाड़ी को दें।',
        'धातु बेचकर पैसे कमाएं।'
      ] : [
        'This is metal waste. It is recyclable and sellable. Collect and sell to scrap dealers.',
        'Metal items can be recycled for money.',
        'Keep metal waste separate and give it to a kabadiwala.'
      ];
    } else if (matchesAny(clothWords)) {
      html = '<div><span style="font-size:2rem;">♻️</span><br><b>' + (isHindi ? 'पुनः उपयोग' : 'Upcycle') + '</b><br>' + (isHindi ? 'पुराने कपड़े सफाई या क्राफ्ट में उपयोग करें।' : 'Old cloth can be used for cleaning or crafts.') + '</div>';
      ttsAnswers = isHindi ? [
        'यह कपड़े का कचरा है। इसे सफाई या क्राफ्ट में उपयोग करें।',
        'पुराने कपड़े से बैग या पोछा बनाएं।',
        'अच्छे कपड़े दान करें, बाकी का पुनः उपयोग करें।'
      ] : [
        'This is cloth waste. Upcycle old cloth for cleaning or crafts.',
        'Old fabric can be reused for cleaning or making bags.',
        'Donate usable clothes, upcycle the rest.'
      ];
    } else if (matchesAny(cowdungWords)) {
      html = '<div><span style="font-size:2rem;">✅</span><br><b>' + (isHindi ? 'बायोडिग्रेडेबल' : 'Biodegradable') + '</b><br>' + (isHindi ? 'कंपोस्ट के लिए उत्तम।' : 'Great for composting and as a booster.') + '</div>';
      ttsAnswers = isHindi ? [
        'यह गोबर है। यह बायोडिग्रेडेबल है और कंपोस्टिंग के लिए उत्तम है।',
        'गोबर को कंपोस्ट में मिलाएं, इससे प्रक्रिया तेज होगी।',
        'कंपोस्ट के लिए गोबर का उपयोग करें।'
      ] : [
        'This is cow dung. It is biodegradable and great for composting.',
        'Cow dung can be used as a compost booster.',
        'Add cow dung to your compost for faster results.'
      ];
    } else if (matchesAny(burnWords)) {
      html = '<div><span style="font-size:2rem;">⚠️</span><br><b>' + (isHindi ? 'मत जलाएं' : 'Do Not Burn') + '</b><br>' + (isHindi ? 'कचरा जलाना हानिकारक है।' : 'Burning waste causes pollution and health problems.') + '</div>';
      ttsAnswers = isHindi ? [
        'कचरा न जलाएं। जलाने से प्रदूषण और स्वास्थ्य समस्याएं होती हैं।',
        'कचरा जलाना पर्यावरण के लिए हानिकारक है।',
        'किसी भी कचरे को जलाने से बचें, सही तरीके से निपटाएं।'
      ] : [
        'Do not burn waste. Burning causes pollution and health problems.',
        'Burning waste is harmful for health and the environment.',
        'Avoid burning any kind of waste. Use proper disposal methods.'
      ];
    } else {
      html = '<div><b>' + (isHindi ? 'कृपया अपने कचरे को अलग करें।' : 'Try to segregate your waste.') + '</b><br>' + (isHindi ? 'गीला और सूखा कचरा अलग रखें, रीसायकल और कंपोस्ट करें।' : 'Compost organic, recycle plastic, glass, and metal.') + '</div>';
      ttsAnswers = isHindi ? [
        'कृपया अपने कचरे को अलग करें। गीला और सूखा कचरा अलग रखें, रीसायकल और कंपोस्ट करें।',
        'कचरे को अलग करने से रीसायकल और कंपोस्टिंग आसान होती है।',
        'गीला और सूखा कचरा अलग रखें।'
      ] : [
        'Try to segregate your waste. Compost organic, recycle plastic, glass, and metal.',
        'Segregate your waste for better recycling and composting.',
        'Separate wet and dry waste for easy disposal.'
      ];
    }
    if (html) {
      suggestionBox.innerHTML = html + '<div style="margin-top:1em;font-size:1.05em;color:#2E7D32;">' + ttsAnswers.map(a => `<div>🔊 ${a}</div>`).join('') + '</div>';
      suggestionBox.style.display = 'block';
      // Speak all answers aloud, one after another
      if (ttsAnswers.length && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let idx = 0;
        function speakNext() {
          if (idx < ttsAnswers.length) {
            const utter = new SpeechSynthesisUtterance(ttsAnswers[idx]);
            utter.lang = isHindi ? 'hi-IN' : 'en-IN';
            utter.onend = () => { idx++; speakNext(); };
            // Check if Hindi voice is available
            if (isHindi) {
              const voices = window.speechSynthesis.getVoices();
              const hasHindi = voices.some(v => v.lang && v.lang.startsWith('hi'));
              if (!hasHindi) {
                suggestionBox.innerHTML += '<div style="color:#b71c1c;font-size:0.95em;margin-top:0.5em;">⚠️ Hindi voice not supported on this device/browser. You may not hear Hindi audio.</div>';
                utter.lang = 'en-IN'; // fallback to English TTS
              }
            }
            window.speechSynthesis.speak(utter);
          }
        }
        // Some browsers need getVoices() to be called once before voices are loaded
        window.speechSynthesis.onvoiceschanged = speakNext;
        speakNext();
      }
    } else {
      suggestionBox.style.display = 'none';
    }
  }

  if (wasteDesc) {
    wasteDesc.addEventListener('input', (e) => showSuggestion(e.target.value));
  }
  
  if (askBtn) {
    askBtn.onclick = () => {
      const wasteText = wasteDesc ? wasteDesc.value.trim() : '';
      if (wasteText === '') {
        suggestionBox.innerHTML = '<div>Please type a waste item in the box above to get advice.</div>';
        suggestionBox.style.display = 'block';
      } else {
        showSuggestion(wasteText);
      }
    };
  }

  // --- Compost Guide Voice Summary (on compost.html) ---
  const compostVoiceBtn = document.getElementById('compost-voice-btn');
  const compostVoiceStatus = document.getElementById('compost-voice-status');
  if (compostVoiceBtn) {
    compostVoiceBtn.onclick = () => {
      const summary = 'To compost: Use fruit and vegetable peels, dry leaves, and cow dung. Avoid plastic and glass. Add natural boosters like jaggery water. Compost is ready in 2 to 3 months. Use it in your garden or fields.';
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(summary);
        utter.lang = 'en-IN';
        window.speechSynthesis.speak(utter);
        if (compostVoiceStatus) compostVoiceStatus.textContent = '🔊 Playing summary...';
        utter.onend = () => { if (compostVoiceStatus) compostVoiceStatus.textContent = ''; };
      } else {
        if (compostVoiceStatus) compostVoiceStatus.textContent = 'Speech not supported.';
      }
    };
  }

  // --- Image Compression ---
  const photoInput = document.getElementById('waste-photo');
  const photoBtn = document.getElementById('photo-btn');
  const photoStatus = document.getElementById('photo-status');
  photoBtn.onclick = function() { photoInput.click(); };
  photoInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = new window.Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const scale = Math.sqrt(100000 / file.size);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function(blob) {
          if (blob.size < 100000) {
            photoStatus.textContent = 'Compressed and ready!';
            // You can now upload blob
          } else {
            photoStatus.textContent = 'Image too large, try a smaller photo.';
          }
        }, 'image/jpeg', 0.7);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Live Price API (Mock) ---
  fetch('rates.json').then(r=>r.json()).then(data => {
    const el = document.getElementById('todays-rates');
    if (el) {
      el.innerHTML = data.rates.map(r => `<div class='rate-item'>${r.type}: <b>₹${r.price}/kg</b></div>`).join('');
    }
  }).catch(()=>{});

  // --- Animate Success Stories ---
  const container = document.querySelector('.success-stories-cards');
  if (!container) return;
  let scrollInt;
  function startScroll() {
    scrollInt = setInterval(()=>{
      container.scrollLeft += 2;
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollLeft = 0;
      }
    }, 30);
  }
  container.addEventListener('mouseenter', ()=>clearInterval(scrollInt));
  container.addEventListener('mouseleave', startScroll);
  startScroll();

  // --- Offline Banner ---
  function showBanner() {
    if (!document.getElementById('offline-banner')) {
      const banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.textContent = 'You are offline. Some features may not work.';
      banner.style = 'position:fixed;top:0;left:0;width:100vw;background:#ff9800;color:#fff;font-size:20px;text-align:center;z-index:9999;padding:8px;';
      document.body.appendChild(banner);
    }
  }
  function hideBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.remove();
  }
  window.addEventListener('offline', showBanner);
  window.addEventListener('online', hideBanner);
  if (!navigator.onLine) showBanner();

  // --- Take a Photo: Simulate analysis and TTS ---
  const photoInput2 = document.getElementById('waste-photo');
  const photoPreview2 = document.getElementById('photo-preview');
  const photoPreviewFrame2 = document.getElementById('photo-preview-frame');
  const photoPlaceholderText2 = photoPreviewFrame2 ? photoPreviewFrame2.querySelector('.photo-placeholder-text') : null;
  let photoResultBox = document.getElementById('photo-result-box');
  if (!photoResultBox && photoPreviewFrame2) {
    photoResultBox = document.createElement('div');
    photoResultBox.id = 'photo-result-box';
    photoResultBox.style.marginTop = '1em';
    photoResultBox.style.fontWeight = '500';
    photoResultBox.style.color = '#2E7D32';
    photoResultBox.style.textAlign = 'center';
    photoPreviewFrame2.parentNode.insertBefore(photoResultBox, photoPreviewFrame2.nextSibling);
  }
  if (photoInput2 && photoPreview2 && photoPreviewFrame2) {
    photoInput2.addEventListener('change', function(e) {
      const file = e.target.files[0];
      let resultText = '';
      if (file) {
        // Simulate analysis based on file name
        const name = file.name.toLowerCase();
        if (name.includes('plastic')) {
          resultText = 'This is plastic waste. It is not biodegradable. Please store it separately for recycling.';
        } else if (name.includes('banana') || name.includes('fruit') || name.includes('veg')) {
          resultText = 'This is biodegradable waste. Compost it for natural fertilizer.';
        } else if (name.includes('glass')) {
          resultText = 'This is glass waste. It is recyclable. Handle with care and sell to scrap dealers.';
        } else if (name.includes('paper')) {
          resultText = 'This is paper waste. It is recyclable. Recycle or upcycle it.';
        } else {
          resultText = 'Waste detected. Please segregate: compost organic, recycle plastic, glass, and metal.';
        }
        if (photoResultBox) {
          photoResultBox.textContent = resultText;
        }
        // Speak the result aloud
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(resultText);
          utter.lang = 'en-IN';
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
      } else {
        if (photoResultBox) photoResultBox.textContent = '';
      }
    });
  }
}); 