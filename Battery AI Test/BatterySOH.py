import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split

# 1. 가상 배터리 데이터 생성 (200 Cycles)
np.random.seed(42)
num_cycles = 200
cycle = np.arange(num_cycles)

# 기본 스트레스 특성
df = pd.read_csv('/battery_soh_training_dataset.csv')
#df = pd.DataFrame({
#    'Cycle': cycle,
#    'Charge_Current': np.random.normal(1.5, 0.05, num_cycles),
#    'Discharge_Current': np.random.normal(2.0, 0.05, num_cycles),
#    'Avg_Temp': np.random.normal(30, 1, num_cycles),
#    'Max_Temp': np.random.normal(32, 1, num_cycles),
#    'SOC_Start': np.zeros(num_cycles),
#    'SOC_End': np.ones(num_cycles) * 100,
#})

# 누적 스트레스량 계산
#df['Cumulative_Ah'] = np.cumsum(df['Discharge_Current'])
#df['Cumulative_Wh'] = df['Cumulative_Ah'] * 3.7  # 가상 전압 기준
#df['Cumulative_Crate'] = df['Cumulative_Ah'] / 3.0  # Nominal Capacity 가정

# SoH (Capacity 감소 기반)
#initial_capacity = 3.0
#capacity = initial_capacity - 0.001 * cycle - 0.000005 * (cycle**2)
#df['Capacity'] = capacity
#df['SoH'] = (capacity / initial_capacity) * 100

# 내부저항 (R) 및 OCV Shift 시뮬레이션
#initial_r = 3.0  # mOhm
#df['R_SOC50'] = initial_r + 0.005 * cycle

# Delta R 계산
#df['Delta_R_SOC50'] = (df['R_SOC50'] - initial_r) / initial_r

# OCV Plateau Shift 시뮬레이션
#df['OCV_Plateau_Shift'] = 0.0001 * (cycle**1.2)

# 2. Feature & Target 설정
feature_columns = [
    'Charge_Current', 'Discharge_Current',
    'Avg_Temp', 'Max_Temp',
    'SOC_Start', 'SOC_End',
    'Cumulative_Ah', 'Cumulative_Wh', 'Cumulative_Crate',
    'Delta_R_SOC50', 'OCV_Plateau_Shift'
]

X = df[feature_columns].values  # 입력 특성
y = df['SoH'].values.reshape(-1, 1)  # 출력 SoH

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# 4. LSTM 입력 형태로 변환 (Batch, Time, Features)
# 간단하게, Cycle 10개 단위 시퀀스를 하나의 입력 시퀀스로 사용
seq_length = 10

def create_sequences(X, y, seq_length):
    Xs, ys = [], []
    for i in range(len(X) - seq_length):
        Xs.append(X[i:(i + seq_length)])
        ys.append(y[i + seq_length])
    return np.array(Xs), np.array(ys)

X_train_seq, y_train_seq = create_sequences(X_train, y_train, seq_length)
X_test_seq, y_test_seq = create_sequences(X_test, y_test, seq_length)

# 5. 학습용 데이터셋 저장
train_dataset = pd.DataFrame({
    'Cycle': cycle[:len(X_train)],
    **{feature: X_train[:, i] for i, feature in enumerate(feature_columns)},
    'SoH': y_train.flatten()
})

test_dataset = pd.DataFrame({
    'Cycle': cycle[len(X_train):],
    **{feature: X_test[:, i] for i, feature in enumerate(feature_columns)},
    'SoH': y_test.flatten()
})

train_dataset.to_csv('train_dataset.csv', index=False)
test_dataset.to_csv('test_dataset.csv', index=False)

# 6. LSTM 모델 구축
model = models.Sequential([
    layers.LSTM(64, input_shape=(seq_length, X.shape[1]), return_sequences=False),
    layers.Dense(32, activation='relu'),
    layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse')
model.summary()

# 7. 모델 학습
history = model.fit(
    X_train_seq, y_train_seq,
    epochs=100,
    batch_size=16,
    validation_split=0.2,
    verbose=1
)

# 8. 평가 및 예측
preds = model.predict(X_test_seq)

# 9. 결과 시각화
plt.figure(figsize=(10, 6))
plt.plot(range(len(y_test_seq)), y_test_seq, label='True SoH')
plt.plot(range(len(preds)), preds, label='Predicted SoH')
plt.xlabel('Cycle (Test Set)')
plt.ylabel('SoH (%)')
plt.title('SoH Prediction by LSTM')
plt.legend()
plt.grid()
plt.show()