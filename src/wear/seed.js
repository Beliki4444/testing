import { MongoClient, ObjectId } from 'mongodb';

// Детерминированный генератор случайных чисел (для воспроизводимости)
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const random = createSeededRandom(42);

// Утилиты
function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const value = random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function randomChoice(arr) {
  return arr[Math.floor(random() * arr.length)];
}

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const machineId = Math.floor(random() * 16777216).toString(16).padStart(6, '0');
  const processId = Math.floor(random() * 65536).toString(16).padStart(4, '0');
  const counter = Math.floor(random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
}

// Пользователи
const USERS = [
  { id: 'user_001', name: 'Алексей', avgBedtime: 23, avgWakeup: 7, hrBase: 58 },
  { id: 'user_002', name: 'Мария', avgBedtime: 0, avgWakeup: 8, hrBase: 62 },
  { id: 'user_003', name: 'Дмитрий', avgBedtime: 22, avgWakeup: 6, hrBase: 55 },
];

// Генерация одной записи сна
function generateSleepSession(user, date, previousSessions) {
  // Время отхода ко сну (с вариацией ±1.5 часа)
  const bedtimeHour = user.avgBedtime + randomFloat(-1.5, 1.5, 1);
  const bedtimeMinute = randomInt(0, 59);

  const bedtimeStart = new Date(date);
  if (bedtimeHour >= 22) {
    bedtimeStart.setHours(Math.floor(bedtimeHour), bedtimeMinute, 0, 0);
  } else {
    // После полуночи
    bedtimeStart.setDate(bedtimeStart.getDate());
    bedtimeStart.setHours(Math.floor(bedtimeHour), bedtimeMinute, 0, 0);
  }

  // Время засыпания (latency 5-30 минут)
  const sleepLatencySeconds = randomInt(300, 1800);
  const sleepOnset = new Date(bedtimeStart.getTime() + sleepLatencySeconds * 1000);

  // Время пробуждения
  const wakeupHour = user.avgWakeup + randomFloat(-1, 1, 1);
  const wakeupMinute = randomInt(0, 59);

  const wakeupTime = new Date(date);
  wakeupTime.setDate(wakeupTime.getDate() + 1);
  wakeupTime.setHours(Math.floor(wakeupHour), wakeupMinute, 0, 0);

  // Время выхода из кровати (0-20 минут после пробуждения)
  const bedtimeEnd = new Date(wakeupTime.getTime() + randomInt(0, 1200) * 1000);

  // Биометрия
  const averageHeartRate = user.hrBase + randomFloat(-5, 8, 3);
  const lowestHeartRate = user.hrBase - randomInt(3, 8);
  const hrv = randomInt(30, 100);
  const respiratoryRate = randomFloat(14, 18, 2);
  const disturbanceCount = randomInt(5, 80);

  // Расчёт длительностей (в секундах)
  const timeInBed = Math.floor((bedtimeEnd - bedtimeStart) / 1000);
  const totalSleepDuration = Math.floor((wakeupTime - sleepOnset) / 1000);

  // Стадии сна
  const awakeDuration = randomInt(600, 3600);
  const remPercent = randomFloat(0.15, 0.25);
  const deepPercent = randomFloat(0.15, 0.25);
  const lightPercent = 1 - remPercent - deepPercent;

  const actualSleepTime = totalSleepDuration - awakeDuration;
  const remSleepDuration = Math.floor(actualSleepTime * remPercent);
  const deepSleepDuration = Math.floor(actualSleepTime * deepPercent);
  const lightSleepDuration = actualSleepTime - remSleepDuration - deepSleepDuration;

  // КОРРЕКТНЫЙ расчёт sleep efficiency (как в Oura)
  const correctSleepEfficiency = Math.round((totalSleepDuration / timeInBed) * 100);

  // СЛОМАННЫЙ расчёт sleep efficiency (баг нашего разработчика в Coya): (total - awake) / total
  const brokenSleepEfficiency = Math.round(((totalSleepDuration - awakeDuration) / totalSleepDuration) * 100);

  // Среднее время засыпания за последние N дней
  function calculateAvgSleepOnset(sessions, days, keyPath) {
    const relevantSessions = sessions.slice(-days);
    if (relevantSessions.length === 0) return null;

    const totalMinutes = relevantSessions.reduce((sum, s) => {
      // Поддержка разных путей к данным (snake_case и camelCase)
      const onsetStr = keyPath === 'snake' ? s.timing.sleep_onset : s.timing.sleepOnset;
      const onset = new Date(onsetStr);
      let minutes = onset.getHours() * 60 + onset.getMinutes();
      // Если время после полуночи, добавляем 24 часа для корректного среднего
      if (onset.getHours() < 12) minutes += 24 * 60;
      return sum + minutes;
    }, 0);

    const avgMinutes = Math.round(totalMinutes / relevantSessions.length) % (24 * 60);
    const hours = Math.floor(avgMinutes / 60);
    const mins = avgMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // КОРРЕКТНОЕ: 10 дней (как в Oura)
  const correctAvgOnset = calculateAvgSleepOnset(previousSessions, 10, 'snake');
  // СЛОМАННОЕ: 7 дней вместо 10 (баг нашего разработчика в Coya)
  const brokenAvgOnset = calculateAvgSleepOnset(previousSessions, 7, 'snake');

  // Скоры
  const sleepScore = randomInt(50, 95);
  const recoveryScore = randomInt(40, 90);
  const readinessScore = recoveryScore + randomInt(-5, 5);

  // Определяем, является ли это дневным сном (10% вероятность)
  const isNap = random() < 0.1;

  const _id = generateObjectId();
  const now = new Date();

  const hrvValue = random() < 0.05 ? null : hrv; // 5% null
  const periodId = random() < 0.1 ? null : crypto.randomUUID();
  const sleepId = crypto.randomUUID();
  const timestampDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();

  // Oura данные (snake_case, КОРРЕКТНЫЕ данные от часов)
  const ouraRecord = {
    _id: new ObjectId(_id),
    user_id: user.id,
    service: 'OuraRing',
    timing: {
      sleep_onset: sleepOnset.toISOString(),
      wakeup_time: wakeupTime.toISOString(),
      bedtime_start: bedtimeStart.toISOString(),
      bedtime_end: bedtimeEnd.toISOString(),
    },
    biometrics: {
      average_heart_rate: averageHeartRate,
      lowest_heart_rate: lowestHeartRate,
      hrv: hrvValue,
      respiratory_rate: respiratoryRate,
      disturbance_count: disturbanceCount,
    },
    classification: {
      is_nap: isNap,
      sleep_type: isNap ? 'nap' : 'sleep',
    },
    metrics: {
      sleep_efficiency: correctSleepEfficiency, // КОРРЕКТНО! total / time_in_bed
      total_sleep_duration: totalSleepDuration,
      time_in_bed: timeInBed,
      sleep_latency: sleepLatencySeconds,
      sleep_score: isNap ? null : sleepScore,
      recovery_score: recoveryScore,
    },
    stages: {
      awake_duration: awakeDuration,
      deep_sleep_duration: deepSleepDuration,
      light_sleep_duration: lightSleepDuration,
      rem_sleep_duration: remSleepDuration,
    },
    aggregates: {
      avg_sleep_onset_last_10_days: correctAvgOnset, // КОРРЕКТНО! реально 10 дней
    },
    external_service_ids: {
      period_id: periodId,
      sleep_id: sleepId,
    },
    metadata: {
      time_zone_offset: '+0300',
      timestamp: timestampDate,
    },
    service_additional_data: {
      readiness_score: readinessScore,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Coya данные (camelCase, СЛОМАННЫЕ данные из-за бага разработчика)
  const coyaRecord = {
    _id: new ObjectId(_id),
    userId: user.id,
    service: 'OuraRing',
    timing: {
      sleepOnset: sleepOnset.toISOString(),
      wakeupTime: wakeupTime.toISOString(),
      bedtimeStart: bedtimeStart.toISOString(),
      bedtimeEnd: bedtimeEnd.toISOString(),
    },
    biometrics: {
      averageHeartRate: averageHeartRate,
      lowestHeartRate: lowestHeartRate,
      hrv: hrvValue,
      respiratoryRate: respiratoryRate,
      disturbanceCount: disturbanceCount,
    },
    classification: {
      isNap: isNap,
      sleepType: isNap ? 'nap' : 'sleep',
    },
    metrics: {
      sleepEfficiency: brokenSleepEfficiency, // СЛОМАНО! (total - awake) / total
      totalSleepDuration: totalSleepDuration,
      timeInBed: timeInBed,
      sleepLatency: sleepLatencySeconds,
      sleepScore: isNap ? null : sleepScore,
      recoveryScore: recoveryScore,
    },
    stages: {
      awakeDuration: awakeDuration,
      deepSleepDuration: deepSleepDuration,
      lightSleepDuration: lightSleepDuration,
      remSleepDuration: remSleepDuration,
    },
    aggregates: {
      avgSleepOnsetLast10Days: brokenAvgOnset, // СЛОМАНО! берёт 7 дней вместо 10
    },
    externalServiceIds: {
      periodId: periodId,
      sleepId: sleepId,
    },
    metadata: {
      timeZoneOffset: '+0300',
      timestamp: timestampDate,
    },
    serviceAdditionalData: {
      readinessScore: readinessScore,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  return { ouraRecord, coyaRecord };
}

// Генерация всех данных для одного пользователя
function generateUserData(user, startDate, days) {
  const ouraRecords = [];
  const coyaRecords = [];

  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const { ouraRecord, coyaRecord } = generateSleepSession(
      user,
      new Date(currentDate),
      ouraRecords
    );

    ouraRecords.push(ouraRecord);
    coyaRecords.push(coyaRecord);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { ouraRecords, coyaRecords };
}

// Конфигурация подключений
const OURA_DB_URI = 'mongodb://gen_user:Slot-Aloft5-Sitter@89.23.102.19:27017/oura?authSource=admin&directConnection=true';
const COYA_DB_URI = 'mongodb://gen_user:Slot-Aloft5-Sitter@89.23.99.17:27017/coya?authSource=admin&directConnection=true';

// Главная функция seed
async function seed() {
  console.log('Connecting to MongoDB...');
  console.log(`  Oura (source):    ${OURA_DB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`  Coya (processed): ${COYA_DB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  const ouraClient = new MongoClient(OURA_DB_URI);
  const coyaClient = new MongoClient(COYA_DB_URI);

  try {
    await Promise.all([ouraClient.connect(), coyaClient.connect()]);
    console.log('Connected successfully to both databases');

    // Базы данных
    const ouraDb = ouraClient.db();
    const coyaDb = coyaClient.db();

    // Очистка коллекций
    console.log('Clearing existing collections...');
    await ouraDb.collection('sleep_sessions').deleteMany({});
    await coyaDb.collection('sleepSessions').deleteMany({});

    // Генерация данных
    const startDate = new Date('2025-10-01');
    const days = 60; // 2 месяца

    let totalOura = 0;
    let totalCoya = 0;

    for (const user of USERS) {
      console.log(`Generating data for ${user.name} (${user.id})...`);

      const { ouraRecords, coyaRecords } = generateUserData(user, startDate, days);

      // Вставка в Oura (источник, snake_case, КОРРЕКТНЫЕ данные)
      await ouraDb.collection('sleep_sessions').insertMany(ouraRecords);
      totalOura += ouraRecords.length;

      // Вставка в Coya (наша система, camelCase, СЛОМАННЫЕ данные)
      await coyaDb.collection('sleepSessions').insertMany(coyaRecords);
      totalCoya += coyaRecords.length;

      console.log(`  - ${ouraRecords.length} records created`);
    }

    console.log('\n=== Seed completed ===');
    console.log(`Oura DB (oura.sleep_sessions): ${totalOura} records - CORRECT data`);
    console.log(`Coya DB (coya.sleepSessions): ${totalCoya} records - BROKEN data`);

    // Показать пример различий
    console.log('\n=== Example of correct vs broken data ===');
    const sampleOura = await ouraDb.collection('sleep_sessions').findOne({ user_id: 'user_001' });
    const sampleCoya = await coyaDb.collection('sleepSessions').findOne({ userId: 'user_001' });

    console.log('\nOura (source, CORRECT):');
    console.log(`  sleep_efficiency: ${sampleOura.metrics.sleep_efficiency}% (total_sleep / time_in_bed)`);
    console.log(`  avg_sleep_onset_last_10_days: ${sampleOura.aggregates.avg_sleep_onset_last_10_days} (real 10 days)`);

    console.log('\nCoya (our system, BROKEN):');
    console.log(`  sleepEfficiency: ${sampleCoya.metrics.sleepEfficiency}% (BUG: (total - awake) / total)`);
    console.log(`  avgSleepOnsetLast10Days: ${sampleCoya.aggregates.avgSleepOnsetLast10Days} (BUG: only 7 days!)`);

  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  } finally {
    await Promise.all([ouraClient.close(), coyaClient.close()]);
    console.log('\nConnections closed');
  }
}

seed();
