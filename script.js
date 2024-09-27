let accumulatedResults = [];
let isRolling = false;
let rollingIntervals = [];

// ダイスを振るボタン
function rollDice() {
    const maxNumberInput = document.getElementById('max-number');
    let maxNumber = parseInt(maxNumberInput.value);

    // バリデーション
    if (isNaN(maxNumber) || maxNumber < 3 || maxNumber > 18) {
        alert('最大値は3から18の間で指定してください。');
        return;
    }

    if (isRolling) return;

    isRolling = true;

    // ボタンの状態を更新
    document.getElementById('roll-button').disabled = true;
    document.getElementById('show-result-button').disabled = false;

    // ダイス表示エリアを準備
    prepareDiceDisplay();

    // ランダムに数字をフラッシュさせる（速度を20msに変更）
    startRollingAnimation(maxNumber, 20);
}

function prepareDiceDisplay() {
    const resultsContainer = document.getElementById('accumulated-results');

    const tempResultDiv = document.createElement('div');
    tempResultDiv.className = 'result-set temp';

    const totalDice = 3;

    for (let i = 0; i < totalDice; i++) {
        const diceDiv = document.createElement('div');
        diceDiv.className = 'dice';
        diceDiv.textContent = '?';
        tempResultDiv.appendChild(diceDiv);
    }

    const existingTempDiv = document.querySelector('.result-set.temp');
    if (existingTempDiv) {
        resultsContainer.replaceChild(tempResultDiv, existingTempDiv);
    } else {
        resultsContainer.prepend(tempResultDiv);
    }
}

function startRollingAnimation(maxNumber, speed) {
    const diceElements = document.querySelectorAll('.result-set.temp .dice');

    rollingIntervals = []; // ここで初期化

    diceElements.forEach(dice => {
        const interval = setInterval(() => {
            dice.textContent = Math.floor(Math.random() * maxNumber) + 1;
        }, speed); // ダイスの速度を調整（ミリ秒）
        rollingIntervals.push(interval);
    });
}

function showResult() {
    // アニメーションを停止
    rollingIntervals.forEach(interval => clearInterval(interval));
    rollingIntervals = [];

    const totalDice = 3;
    const maxNumberInput = document.getElementById('max-number');
    let maxNumber = parseInt(maxNumberInput.value);

    const fixedNumbers = Array(totalDice).fill(null);
    const usedPositions = [];

    // エラーフラグ
    let hasError = false;

    // 固定1の情報を取得
    const fixedNumber1Input = document.getElementById('fixed-number1');
    const fixed1PositionInput = document.querySelector('input[name="fixed1-position"]:checked');

    if (fixedNumber1Input.value !== '') {
        let num = parseInt(fixedNumber1Input.value);
        if (isNaN(num) || num < 1 || num > 18) {
            alert('固定1は1から18の間で指定してください。');
            hasError = true;
        } else if (!fixed1PositionInput) {
            alert('固定1の位置を選択してください。');
            hasError = true;
        } else {
            let position = parseInt(fixed1PositionInput.value) - 1;
            if (usedPositions.includes(position)) {
                alert('固定数字の位置が重複しています。異なる位置を指定してください。');
                hasError = true;
            } else {
                fixedNumbers[position] = num;
                usedPositions.push(position);
            }
        }
    } else {
        // 固定数字が未入力の場合、位置選択を解除
        if (fixed1PositionInput) {
            fixed1PositionInput.checked = false;
        }
    }

    // 固定2の情報を取得
    const fixedNumber2Input = document.getElementById('fixed-number2');
    const fixed2PositionInput = document.querySelector('input[name="fixed2-position"]:checked');

    if (fixedNumber2Input.value !== '') {
        let num = parseInt(fixedNumber2Input.value);
        if (isNaN(num) || num < 1 || num > 18) {
            alert('固定2は1から18の間で指定してください。');
            hasError = true;
        } else if (!fixed2PositionInput) {
            alert('固定2の位置を選択してください。');
            hasError = true;
        } else {
            let position = parseInt(fixed2PositionInput.value) - 1;
            if (usedPositions.includes(position)) {
                alert('固定数字の位置が重複しています。異なる位置を指定してください。');
                hasError = true;
            } else {
                fixedNumbers[position] = num;
                usedPositions.push(position);
            }
        }
    } else {
        // 固定数字が未入力の場合、位置選択を解除
        if (fixed2PositionInput) {
            fixed2PositionInput.checked = false;
        }
    }

    if (hasError) {
        // エラーが発生した場合でも状態をリセット
        isRolling = false;
        document.getElementById('roll-button').disabled = false;
        document.getElementById('show-result-button').disabled = true;
        return;
    }

    // 固定数字の重複をチェック
    const fixedValues = fixedNumbers.filter(num => num !== null);
    if (fixedValues.length !== new Set(fixedValues).size) {
        alert('固定数字が重複しています。異なる数字を指定してください。');
        isRolling = false;
        document.getElementById('roll-button').disabled = false;
        document.getElementById('show-result-button').disabled = true;
        return;
    }

    // ランダム数字の候補を作成
    let availableNumbers = [];
    for (let i = 1; i <= maxNumber; i++) {
        if (!fixedValues.includes(i)) {
            availableNumbers.push(i);
        }
    }

    if (availableNumbers.length < totalDice - fixedValues.length) {
        alert('固定数字の数が多すぎます。固定数字を減らすか、最大値を増やしてください。');
        isRolling = false;
        document.getElementById('roll-button').disabled = false;
        document.getElementById('show-result-button').disabled = true;
        return;
    }

    // ランダムに数字を選択
    availableNumbers = availableNumbers.sort(() => Math.random() - 0.5);

    let randomIndex = 0;
    for (let i = 0; i < totalDice; i++) {
        if (fixedNumbers[i] === null) {
            fixedNumbers[i] = availableNumbers[randomIndex];
            randomIndex++;
        }
    }

    // BOXオプションがチェックされている場合、昇順にソート
    const boxCheckbox = document.getElementById('box-checkbox');
    let resultNumbers = [...fixedNumbers];
    if (boxCheckbox.checked) {
        resultNumbers.sort((a, b) => a - b);
    }

    // 蓄積された結果の先頭に追加
    accumulatedResults.unshift(resultNumbers);

    // 表示を更新
    updateAccumulatedResults();

    // 状態をリセット
    isRolling = false;
    document.getElementById('roll-button').disabled = false;
    document.getElementById('show-result-button').disabled = true;
    document.getElementById('save-image-button').disabled = accumulatedResults.length === 0;
    document.getElementById('share-button').disabled = accumulatedResults.length === 0; // 共有ボタンの状態を更新
}

function updateAccumulatedResults() {
    const resultsContainer = document.getElementById('accumulated-results');
    resultsContainer.innerHTML = ''; // 既存の内容をクリア

    accumulatedResults.forEach(resultSet => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-set';

        resultSet.forEach(number => {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'dice';
            numberDiv.textContent = number;
            resultDiv.appendChild(numberDiv);
        });

        resultsContainer.appendChild(resultDiv);
    });
}

function resetResults() {
    accumulatedResults = [];
    rollingIntervals.forEach(interval => clearInterval(interval));
    rollingIntervals = [];
    isRolling = false;
    document.getElementById('roll-button').disabled = false;
    document.getElementById('show-result-button').disabled = true;
    document.getElementById('save-image-button').disabled = true;
    document.getElementById('share-button').disabled = true; // 共有ボタンを無効化
    const resultsContainer = document.getElementById('accumulated-results');
    resultsContainer.innerHTML = '';

    // 入力フィールドとラジオボタンのリセット
    document.getElementById('fixed-number1').value = '';
    document.getElementById('fixed-number2').value = '';

    const fixed1Positions = document.querySelectorAll('input[name="fixed1-position"]');
    fixed1Positions.forEach(radio => radio.checked = false);

    const fixed2Positions = document.querySelectorAll('input[name="fixed2-position"]');
    fixed2Positions.forEach(radio => radio.checked = false);

    document.getElementById('box-checkbox').checked = false;
}

function saveResultAsImage() {
    const resultsContainer = document.getElementById('accumulated-results');

    if (accumulatedResults.length === 0) {
        alert('保存する結果がありません。');
        return;
    }

    // 透かしをCSSから削除し、Canvasに直接描画するため透かしクラスは不要です
    // html2canvasでキャプチャ
    html2canvas(resultsContainer, {
        scale: 2,
        useCORS: true,
        logging: false, // ログを無効に
    }).then(canvas => {
        // Canvasに透かしを直接描画
        const ctx = canvas.getContext('2d');

        // 透かしの設定
        const watermarkText = 'toa'; // 透かし文字
        const fontSize = 20; // フォントサイズ
        const opacity = 0.05; // 透かしの濃さ（0～1で指定）
        const angle = -45 * Math.PI / 180; // 透かしの角度（ラジアン）
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 透かしの密度と位置調整
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const stepX = 80; // X方向の間隔（調整可能）
        const stepY = 80; // Y方向の間隔（調整可能）

        ctx.save();
        ctx.rotate(angle);

        for (let x = -canvasHeight; x < canvasWidth * 2; x += stepX) {
            for (let y = 0; y < canvasHeight * 2; y += stepY) {
                ctx.fillText(watermarkText, x, y);
            }
        }

        ctx.restore();

        // タイムスタンプを生成
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;

        // Blobを生成してダウンロード
        canvas.toBlob(function(blob) {
            if (blob === null) {
                alert('画像の保存中にエラーが発生しました。');
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `results_${timestamp}.png`;
            link.href = url;

            // iOS SafariではリンクをDOMに追加する必要があります
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }).catch(error => {
        console.error('画像の保存中にエラーが発生しました:', error);
        alert('画像の保存中にエラーが発生しました。コンソールを確認してください。');
    });
}

// 共有ボタンのイベントリスナーを追加
document.getElementById('share-button').addEventListener('click', shareResult);

// 共有機能の実装
function shareResult() {
    const resultsContainer = document.getElementById('accumulated-results');

    if (accumulatedResults.length === 0) {
        alert('共有する結果がありません。');
        return;
    }

    // html2canvasで結果をキャプチャ
    html2canvas(resultsContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
    }).then(canvas => {
        // Canvasを画像URLに変換
        canvas.toBlob(function(blob) {
            if (blob === null) {
                alert('共有中にエラーが発生しました。');
                return;
            }
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.src = url;

            // 画像をDataURLに変換
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                const base64data = reader.result;

                // Web Share API がサポートされているか確認
                if (navigator.share) {
                    navigator.share({
                        title: 'レース結果',
                        text: '最新のレース結果です！',
                        files: [new File([blob], `results_${getTimestamp()}.png`, { type: 'image/png' })],
                    }).then(() => {
                        console.log('共有成功');
                    }).catch((error) => {
                        console.error('共有失敗:', error);
                    });
                } else {
                    // Web Share API がサポートされていない場合のフォールバック
                    // クリップボードにコピー
                    copyToClipboard(base64data).then(() => {
                        alert('結果をクリップボードにコピーしました。任意の場所に貼り付けて共有してください。');
                    }).catch((error) => {
                        console.error('コピー失敗:', error);
                        alert('共有に失敗しました。');
                    });
                }
            }
        }, 'image/png');
    }).catch(error => {
        console.error('共有中にエラーが発生しました:', error);
        alert('共有中にエラーが発生しました。コンソールを確認してください。');
    });
}

// クリップボードにコピーする関数
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

// タイムスタンプを生成する関数
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

document.getElementById('roll-button').addEventListener('click', rollDice);
document.getElementById('show-result-button').addEventListener('click', showResult);
document.getElementById('reset-button').addEventListener('click', resetResults);
document.getElementById('save-image-button').addEventListener('click', saveResultAsImage);
