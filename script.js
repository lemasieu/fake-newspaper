document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const previewDiv = document.getElementById('newspaper-preview');

    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
    const removeImageBtn = document.getElementById('remove-image-btn');

    const newspaperNameInput = document.getElementById('newspaper-name');

    let uploadedImageData = null;

    // ============================================================
    // 1) CHUẨN HÓA CHUỖI — chống mọi kiểu ngụy trang
    // ============================================================
    // Bảng homoglyph: ký tự Cyrillic/Greek nhìn giống chữ Latin
    const HOMOGLYPH_MAP = {
        // Cyrillic → Latin
        'а':'a','е':'e','о':'o','р':'p','с':'c','у':'y','х':'x',
        'і':'i','ј':'j','ѕ':'s','һ':'h','ν':'v','А':'a','Е':'e',
        'О':'o','Р':'p','С':'c','У':'y','Х':'x','І':'i','Ј':'j',
        'Ѕ':'s','Η':'h',
        // Greek → Latin
        'α':'a','ε':'e','ο':'o','ρ':'p','τ':'t','ι':'i','κ':'k',
        'μ':'m','Α':'a','Β':'b','Ε':'e','Ζ':'z','Η':'h','Ι':'i',
        'Κ':'k','Μ':'m','Ν':'n','Ο':'o','Ρ':'p','Τ':'t','Υ':'y','Χ':'x'
    };

    function normalize(str) {
        let s = String(str || '');
        // (1) NFKC: gom ký tự "fancy" (𝟏, Ⓐ, Ａ, ﬁ…) về ASCII cơ bản
        s = s.normalize('NFKC');
        // (2) Map homoglyph Cyrillic/Greek → Latin; ký tự lạ khác bị xóa
        s = s.replace(/[\u0370-\u03FF\u0400-\u04FF]/g, ch => HOMOGLYPH_MAP[ch] || '');
        // (3) NFD + xóa dấu tiếng Việt
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // (4) đ / Đ → d
        s = s.replace(/đ/g, 'd').replace(/Đ/g, 'd');
        // (5) lowercase
        s = s.toLowerCase();
        // (6) BỎ HẾT mọi ký tự không phải [a-z0-9]
        //     → space, dấu chấm, gạch dưới, emoji, ký tự zero-width… đều biến mất
        s = s.replace(/[^a-z0-9]/g, '');
        return s;
    }

    // ============================================================
    // 2) DANH SÁCH TỪ KHÓA CẦN CHẶN
    //    Viết ở dạng thô, tự động pack qua normalize() khi nạp.
    //    Chỉ cần thêm 1 dòng vào mảng là có tác dụng ngay.
    // ============================================================
    const RESTRICTED_KEYWORDS_RAW = [
        // === Báo trung ương / lớn ===
        'Nhân Dân', 'Quân đội Nhân dân', 'Lao Động', 'Tuổi Trẻ',
        'Thanh Niên', 'Tiền Phong', 'Phụ Nữ', 'Pháp Luật',
        'Công An', 'An Ninh Thủ Đô', 'An Ninh',
        'VietnamNet', 'VnExpress', 'Dân Trí', 'Người Lao Động',
        'VOV', 'VTV', 'Đài Truyền hình', 'Đài Tiếng nói',
        'Thông tấn xã', 'TTXVN', 'VietnamPlus', 'VNA',
        'Sài Gòn Giải Phóng', 'SGGP', 'Hà Nội Mới',
        'Kinh Tế Sài Gòn', 'Đầu Tư', 'CafeF', 'CafeBiz',
        'Zing', 'Kenh14', 'SoHa', '24h', 'Ngôi Sao',
        'Bóng Đá', 'Thể Thao', 'VietnamNews',
        'Báo Chính phủ', 'Báo Quốc tế', 'Báo Mới',
        // === Báo khác phổ biến ===
        'Thanh Tra', 'Quân đội', 'Công Lý', 'Bảo Vệ',
        'Người Việt', 'Việt Báo', 'VietnamDaily', 'Người Đưa Tin',
        'Đời sống', 'Gia đình', 'Thế giới', 'Khoa học',
        'Giáo dục', 'Thể thao Văn hóa', 'Sức khỏe',
        'Doanh nhân', 'Doanh nghiệp', 'Thương trường',
        'Bất động sản', 'Tài chính', 'Nông nghiệp',
        'Nông thôn', 'Văn hóa', 'Nghệ thuật', 'Giải trí',
        'Thế giới sao', 'Dân Việt', 'Tin nhanh', 'Tin mới',
        'Tin tức', 'VTC News', 'VTC', 'Đại đoàn kết',
        'Báo điện tử', 'Báo giấy',
        // === Cơ quan nhà nước (dễ bị lợi dụng) ===
        'Chính phủ', 'Quốc hội', 'Nhà nước', 'Chính thống',
        'Đảng Cộng sản', 'Cộng sản', 'Bộ Thông tin', 'Bộ TT&TT',
        // === Báo địa phương ===
        "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "Huế",
        "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
        "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận",
        "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai",
        "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tây", "Hà Tĩnh", "Hải Dương",
        "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum",
        "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An",
        "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
        "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
        "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
        "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
        // === Báo quốc tế dễ bị giả ===
        'CNN', 'BBC', 'Reuters', 'AP News', 'New York Times',
        'The Guardian', 'Forbes', 'Bloomberg'
    ];

    // Pack + sort theo độ dài giảm dần (báo cáo cụm cụ thể nhất trước)
    const RESTRICTED_KEYWORDS = RESTRICTED_KEYWORDS_RAW
        .map(raw => ({ raw, normalized: normalize(raw) }))
        .filter(k => k.normalized.length >= 3)
        .sort((a, b) => b.normalized.length - a.normalized.length);

    // Trả về tên gốc của từ khóa vi phạm, hoặc null nếu an toàn
    function findRestrictedKeyword(name) {
        const n = normalize(name);
        if (!n) return null;
        for (const kw of RESTRICTED_KEYWORDS) {
            if (n.includes(kw.normalized)) return kw.raw;
        }
        return null;
    }

    // ============================================================
    // 3) CẢNH BÁO REALTIME DƯỚI Ô TÊN BÁO
    // ============================================================
    let dynamicWarning = newspaperNameInput.parentElement.querySelector('.dynamic-warning');
    if (!dynamicWarning) {
        dynamicWarning = document.createElement('div');
        dynamicWarning.className = 'dynamic-warning';
        newspaperNameInput.parentElement.appendChild(dynamicWarning);
    }

    function validateName() {
        const value = newspaperNameInput.value.trim();
        if (!value) {
            newspaperNameInput.classList.remove('input-error');
            dynamicWarning.classList.remove('active');
            return true;
        }
        const bad = findRestrictedKeyword(value);
        if (bad) {
            newspaperNameInput.classList.add('input-error');
            dynamicWarning.innerHTML =
                `🚫 Tên chứa từ khóa <b>"${bad}"</b> trùng với báo/cơ quan thật. ` +
                `Vui lòng đổi sang tên hư cấu khác (xem gợi ý trong ô nhập liệu).`;
            dynamicWarning.classList.add('active');
            return false;
        }
        newspaperNameInput.classList.remove('input-error');
        dynamicWarning.classList.remove('active');
        return true;
    }

    newspaperNameInput.addEventListener('input', validateName);
    newspaperNameInput.addEventListener('blur', validateName);

    // ============================================================
    // 4) XỬ LÝ UPLOAD ẢNH (giữ nguyên)
    // ============================================================
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn một file ảnh hợp lệ.');
            imageUpload.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh quá lớn (tối đa 5MB). Vui lòng chọn ảnh nhỏ hơn.');
            imageUpload.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageData = e.target.result;
            imagePreview.src = uploadedImageData;
            imagePreviewWrapper.classList.add('active');
        };
        reader.onerror = () => alert('Không thể đọc file ảnh. Vui lòng thử lại.');
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener('click', () => {
        uploadedImageData = null;
        imageUpload.value = '';
        imagePreview.src = '';
        imagePreviewWrapper.classList.remove('active');
    });

    // ============================================================
    // 5) TẠO NỘI DUNG TỜ BÁO
    // ============================================================
    function generateNewspaper() {
        const name = newspaperNameInput.value.trim() || 'Báo Lá Cải Hư Cấu';

        // Chặn nếu tên không an toàn
        if (!validateName()) {
            const bad = findRestrictedKeyword(name);
            alert(
                `Không thể tạo báo.\n\n` +
                `Tên "${name}" chứa từ khóa "${bad}" trùng với báo/cơ quan thật đang hoạt động.\n` +
                `Vui lòng đổi sang một tên hư cấu khác (xem gợi ý trong ô nhập liệu).`
            );
            newspaperNameInput.focus();
            return;
        }

        const date = document.getElementById('article-date').value || 'Hôm nay';
        const headline = document.getElementById('headline').value || 'TIÊU ĐỀ GÂY SỐC';
        const content = document.getElementById('article-content').value || 'Nội dung bài báo...';

        const paragraphs = content
            .split('\n')
            .filter(p => p.trim() !== '')
            .map(p => `<p>${p}</p>`)
            .join('');

        const figureHTML = uploadedImageData
            ? `<figure class="newspaper-figure">
                   <img src="${uploadedImageData}" alt="Ảnh minh họa">
                   <figcaption>Ảnh minh họa cho bài viết</figcaption>
               </figure>`
            : '';

        previewDiv.innerHTML = `
            <div class="newspaper-header">
                <div class="newspaper-name">${name}</div>
                <div class="newspaper-date">${date}</div>
            </div>
            <div class="newspaper-headline">${headline}</div>
            <div class="newspaper-body">
                ${figureHTML}
                ${paragraphs}
            </div>
            <div class="credit-line">
                Ảnh fake được tạo tại www.sieu.io.vn/j4f/fake-newspaper<br>
                Tên báo không là không có thật, không có tính pháp lý.<br>
                Người dùng tự chịu trách nhiệm khi tạo và dùng ảnh này.
            </div>
        `;

        downloadBtn.disabled = false;
    }

    // ============================================================
    // 6) TẢI ẢNH
    // ============================================================
    function downloadImage() {
        html2canvas(previewDiv, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#f4f1ea'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'bao-la-cai.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Lỗi khi tạo ảnh: ', err);
            alert('Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.');
        });
    }

    generateBtn.addEventListener('click', generateNewspaper);
    downloadBtn.addEventListener('click', downloadImage);
});