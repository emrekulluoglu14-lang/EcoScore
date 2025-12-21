// GOOGLE APPS SCRIPT URL'Nİ BURAYA YAPIŞTIR
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIE4FUXS64Jgs-jqq2b7Z08hPjaRDRxzvRGpbGZ4c795_g8C8nfPnM4tBKQ2uaXOEm/exec';

// GLOBAL DEĞİŞKENLER
let mevcutKullanici = null;
let isLoading = false;

// SAYFA YÜKLENDİĞİNDE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Oyun Sitesi yükleniyor...');
    showNotification('Oyun Dünyasına Hoş Geldiniz!', 'info');
});

// GOOGLE APPS SCRIPT'E İSTEK GÖNDER
function callGoogleScript(functionName, data = {}) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('action', functionName);
        
        // Datayı ekle
        for (const key in data) {
            formData.append(key, data[key]);
        }
        
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        })
        .then(response => {
            // no-cors modunda response okunamaz, alternatif çözüm
            resolve({ success: true });
        })
        .catch(error => {
            // Fallback: JSONP benzeri yaklaşım
            const script = document.createElement('script');
            script.src = `${APPS_SCRIPT_URL}?callback=handleResponse&action=${functionName}&${new URLSearchParams(data)}`;
            document.head.appendChild(script);
            
            window.handleResponse = function(response) {
                document.head.removeChild(script);
                delete window.handleResponse;
                resolve(response);
            };
            
            setTimeout(() => {
                document.head.removeChild(script);
                delete window.handleResponse;
                reject(new Error('Timeout'));
            }, 10000);
        });
    });
}

// BİLDİRİM GÖSTER
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span>';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// MODAL İŞLEMLERİ
function girisModalAc() {
    document.getElementById('girisModal').style.display = 'block';
    document.getElementById('girisEmail').focus();
}

function kayitModalAc() {
    document.getElementById('kayitModal').style.display = 'block';
    document.getElementById('kayitEmail').focus();
}

function modalKapat(modalId) {
    document.getElementById(modalId).style.display = 'none';
    clearInputs();
}

function clearInputs() {
    document.getElementById('girisEmail').value = '';
    document.getElementById('girisSifre').value = '';
    document.getElementById('kayitEmail').value = '';
    document.getElementById('kayitSifre').value = '';
    document.getElementById('kayitAdi').value = '';
}

// EMAIL VALIDATION
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// GİRİŞ YAP
async function girisYap() {
    if (isLoading) return;
    
    const email = document.getElementById('girisEmail').value.trim();
    const sifre = document.getElementById('girisSifre').value;
    
    if (!email || !sifre) {
        showNotification('Lütfen email ve şifrenizi girin!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir email adresi girin!', 'error');
        return;
    }
    
    isLoading = true;
    const btn = document.getElementById('girisButton');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> Giriş yapılıyor...';
    btn.disabled = true;
    
    try {
        const response = await callGoogleScript('girisYap', { email, sifre });
        
        if (response.success) {
            mevcutKullanici = response.kullanici;
            modalKapat('girisModal');
            kullaniciBilgileriniGoster();
            siralamayiYukle();
            anketiYukle();
            showNotification('🎉 Hoş geldin ' + mevcutKullanici.adi + '!', 'success');
        } else {
            showNotification(response.message, 'error');
        }
    } catch (error) {
        showNotification('Sunucu hatası! Lütfen tekrar deneyin.', 'error');
    } finally {
        isLoading = false;
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}

// KAYIT OL
async function kayitOl() {
    if (isLoading) return;
    
    const email = document.getElementById('kayitEmail').value.trim();
    const sifre = document.getElementById('kayitSifre').value;
    const adi = document.getElementById('kayitAdi').value.trim();
    
    if (!email || !sifre || !adi) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir email adresi girin!', 'error');
        return;
    }
    
    if (sifre.length < 4) {
        showNotification('Şifre en az 4 karakter olmalıdır!', 'error');
        return;
    }
    
    if (adi.length < 3) {
        showNotification('Kullanıcı adı en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    isLoading = true;
    const btn = document.getElementById('kayitButton');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> Kaydediliyor...';
    btn.disabled = true;
    
    try {
        const response = await callGoogleScript('kayitOl', { email, sifre, kullaniciAdi: adi });
        
        if (response.success) {
            mevcutKullanici = response.kullanici;
            modalKapat('kayitModal');
            kullaniciBilgileriniGoster();
            siralamayiYukle();
            anketiYukle();
            showNotification('🎉 Tebrikler ' + mevcutKullanici.adi + '! Kaydın başarıyla oluşturuldu.', 'success');
        } else {
            showNotification(response.message, 'error');
        }
    } catch (error) {
        showNotification('Sunucu hatası! Lütfen tekrar deneyin.', 'error');
    } finally {
        isLoading = false;
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}

// KULLANICI BİLGİLERİNİ GÖSTER
function kullaniciBilgileriniGoster() {
    if (!mevcutKullanici) return;
    
    document.getElementById('kullaniciPanel').style.display = 'block';
    document.getElementById('siralama').style.display = 'block';
    document.getElementById('anket').style.display = 'block';
    
    document.getElementById('kullaniciAdi').textContent = mevcutKullanici.adi;
    document.getElementById('puan').textContent = mevcutKullanici.puan;
    document.getElementById('streak').textContent = mevcutKullanici.streak;
}

// SIRALAMAYI YÜKLE
async function siralamayiYukle() {
    try {
        const siralama = await callGoogleScript('siralamayiGetir');
        
        const tbody = document.querySelector('#siralamaTablosu tbody');
        
        if (!siralama || siralama.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #888;">Henüz sıralama verisi yok</td></tr>';
            return;
        }
        
        let html = '';
        siralama.forEach(function(kullanici) {
            const isMe = mevcutKullanici && kullanici.email === mevcutKullanici.email;
            const rowClass = isMe ? 'class="benim-satirim"' : '';
            
            html += '<tr ' + rowClass + '>' +
                    '<td>' + kullanici.sira + '</td>' +
                    '<td>' + kullanici.adi + (isMe ? ' <i class="fas fa-user" style="color:#6a11cb;"></i>' : '') + '</td>' +
                    '<td>' + kullanici.puan + '</td>' +
                    '<td>' + kullanici.streak + ' gün</td>' +
                    '</tr>';
        });
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Sıralama yükleme hatası:', error);
    }
}

// ANKETİ YÜKLE
async function anketiYukle() {
    if (!mevcutKullanici) return;
    
    try {
        const response = await callGoogleScript('anketGetir');
        
        const sorularDiv = document.getElementById('sorular');
        let html = '';
        
        response.sorular.forEach(function(soru, index) {
            html += '<div class="soru">' +
                    '<h4>' + (index + 1) + '. ' + soru.soru + '</h4>' +
                    '<div class="secenekler">';
            
            soru.secenekler.forEach(function(secenek, secIndex) {
                html += '<label class="secenek">' +
                        '<input type="radio" name="soru' + soru.id + '" value="' + secenek + '" required>' +
                        secenek +
                        '</label>';
            });
            
            html += '</div></div>';
        });
        
        sorularDiv.innerHTML = html;
    } catch (error) {
        console.error('Anket yükleme hatası:', error);
    }
}

// ANKET GÖNDER
async function anketGonder() {
    if (!mevcutKullanici) {
        showNotification('Lütfen önce giriş yapın!', 'error');
        girisModalAc();
        return;
    }
    
    // Tüm sorular cevaplanmış mı kontrol et
    const soruIds = [1, 2, 3, 4, 5];
    let allAnswered = true;
    
    for (const soruId of soruIds) {
        const checked = document.querySelector('input[name="soru' + soruId + '"]:checked');
        if (!checked) {
            allAnswered = false;
            break;
        }
    }
    
    if (!allAnswered) {
        showNotification('Lütfen tüm soruları cevaplayın!', 'error');
        return;
    }
    
    if (confirm('Anketi gönderip 100 puan kazanmak istediğinize emin misiniz?')) {
        const btn = document.getElementById('anketGonderBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Gönderiliyor...';
        btn.disabled = true;
        
        try {
            const response = await callGoogleScript('puanEkle', {
                email: mevcutKullanici.email,
                puanMiktar: 100
            });
            
            if (response.success) {
                mevcutKullanici.puan = response.yeniPuan;
                kullaniciBilgileriniGoster();
                siralamayiYukle();
                document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
                showNotification('🎉 Tebrikler! 100 puan kazandınız! Toplam: ' + response.yeniPuan + ' puan', 'success');
            } else {
                showNotification(response.message || 'Hata oluştu!', 'error');
            }
        } catch (error) {
            showNotification('Sunucu hatası!', 'error');
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    }
}

// OYUNU AÇ
function oyunuAc() {
    if (!mevcutKullanici) {
        showNotification('Oyunu oynamak için lütfen giriş yapın!', 'error');
        girisModalAc();
        return;
    }
    
    // BURAYA KENDİ OYUN URL'NİZİ YAZIN
    const oyunUrl = 'https://example.com/oyununuz';
    window.open(oyunUrl, '_blank');
}

// ENTER TUŞU İLE GİRİŞ/KAYIT
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        if (document.getElementById('girisModal').style.display === 'block') {
            girisYap();
        } else if (document.getElementById('kayitModal').style.display === 'block') {
            kayitOl();
        }
    }
});

// MODAL DIŞINA TIKLAYINCA KAPAT
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
