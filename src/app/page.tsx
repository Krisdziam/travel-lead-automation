import Image from "next/image";

const journeyTypes = [
  { number: "01", title: "Біля моря", description: "Спокійний відпочинок на узбережжі — з ритмом, який підходить саме вам." },
  { number: "02", title: "У новому місті", description: "Вулиці, локальні місця й достатньо часу, щоб відчути місто без поспіху." },
  { number: "03", title: "Удвох", description: "Романтична подорож, у якій продумані і важливі моменти, і час для спонтанності." },
  { number: "04", title: "Усією родиною", description: "Зручний маршрут для дорослих і дітей — без зайвих переїздів та перевантаження." },
  { number: "05", title: "Ще не вирішили?", description: "Розкажіть про настрій і бюджет — допоможемо обрати напрямок." },
];

const reasons = [
  { title: "Не готовий пакет, а ваша подорож", description: "Починаємо з ваших побажань, темпу, складу подорожі та того, що для вас справді важливо." },
  { title: "Планування в межах бюджету", description: "Відверто говоримо про варіанти й компроміси, щоб пропозиція залишалася реалістичною." },
  { title: "Один зрозумілий контакт", description: "Вам не доведеться щоразу пояснювати запит заново різним людям." },
  { title: "Поруч і після бронювання", description: "Допомагаємо зорієнтуватися в документах і наступних діях під час подорожі." },
];

const faqItems = [
  { question: "Чи зобов’язує заявка до бронювання?", answer: "Ні. Заявка допоможе нам зрозуміти ваш запит і підготувати пропозицію. Рішення про бронювання ви приймаєте після обговорення деталей." },
  { question: "Коли зі мною зв’яжуться?", answer: "Точний час першої відповіді ми зафіксуємо перед запуском форми. У пропозиції буде чесно вказано, коли очікувати на зв’язок." },
  { question: "Чи можна звернутися без обраного напрямку?", answer: "Так. Достатньо розповісти про бажаний формат відпочинку, приблизні дати та бюджет — ми допоможемо звузити вибір." },
  { question: "Як працює підтримка під час подорожі?", answer: "Планові питання вирішуємо щодня з 09:00 до 19:00 за київським часом. Якщо проблема термінова й виникла пізніше, напишіть у Telegram — терміновий канал під час подорожі залишається відкритим." },
  { question: "Що робити в екстреній ситуації?", answer: "Якщо є загроза життю або здоров’ю, насамперед зверніться до місцевої екстреної служби. Mandra не замінює лікаря, страхову компанію чи екстрені служби." },
];

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

function RouteMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 32" className="route-mark">
      <path d="M5 23c10-20 23 8 34-9 7-10 16 4 28-8" />
      <circle cx="5" cy="23" r="3" /><circle cx="67" cy="6" r="3" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Перейти до основного вмісту</a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#top" aria-label="Mandra Travel — на початок сторінки">
            <span className="wordmark-mark" aria-hidden="true">M</span><span>Mandra <i>Travel</i></span>
          </a>
          <nav className="desktop-nav" aria-label="Основна навігація">
            <a href="#how-it-works">Як це працює</a><a href="#journeys">Подорожі</a><a href="#support">Підтримка</a><a href="#faq">FAQ</a>
          </nav>
          <a className="button button-small" href="#request">Підібрати подорож</a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Персональне планування подорожей</p>
              <h1 id="hero-title">Ваша наступна подорож — <em>продумана нами.</em></h1>
              <p className="hero-description">Розкажіть, куди й як хочете подорожувати. Ми підготуємо персональну пропозицію та залишатимемося на зв’язку до, під час і після подорожі.</p>
              <div className="hero-actions">
                <a className="button" href="#request">Підібрати подорож<ArrowIcon /></a>
                <a className="text-link" href="#how-it-works">Як це працює <span aria-hidden="true">↓</span></a>
              </div>
              <p className="hero-note"><span aria-hidden="true">✓</span>Заявка не зобов’язує до бронювання.</p>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <Image src="/images/mandra-coastal-train.png" alt="Краєвид морського узбережжя з вікна потяга та карта в руках мандрівника" fill priority sizes="(max-width: 899px) 100vw, 46vw" />
              </div>
              <p className="image-caption"><span>Подорож починається з відчуття</span><span>Маршрут у вашому ритмі</span></p>
            </div>
          </div>
        </section>

        <section className="section how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><p className="eyebrow">Просто й без зайвих кроків</p><h2 id="how-title">Як це працює</h2></div>
              <p>Від першої розмови до повернення додому — ви знаєте, що відбувається далі і до кого звернутися.</p>
            </div>
            <ol className="steps-list">
              <li><span className="step-number">01</span><div><h3>Розкажіть про подорож</h3><p>Поділіться ідеєю, приблизними датами й побажаннями. Точний напрямок можна ще не знати.</p></div></li>
              <li><span className="step-number">02</span><div><h3>Отримайте персональну пропозицію</h3><p>Ми доберемо варіанти під ваш ритм, склад подорожі та орієнтовний бюджет.</p></div></li>
              <li><span className="step-number">03</span><div><h3>Погодьте деталі</h3><p>Разом уточнимо маршрут і умови. Бронювання відбувається лише після вашої згоди.</p></div></li>
              <li><span className="step-number">04</span><div><h3>Залишайтеся на зв’язку</h3><p>Під час подорожі у вас буде один зрозумілий контакт для запитань і координації.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="section journeys-section" id="journeys" aria-labelledby="journeys-title">
          <div className="shell">
            <div className="section-heading"><p className="eyebrow">Не каталог, а початок розмови</p><h2 id="journeys-title">Яку подорож ви уявляєте?</h2></div>
            <div className="journey-grid">
              {journeyTypes.map((journey) => <article className="journey-card" key={journey.number}><span>{journey.number}</span><div><h3>{journey.title}</h3><p>{journey.description}</p></div><RouteMark /></article>)}
            </div>
          </div>
        </section>

        <section className="section why-section" id="why" aria-labelledby="why-title">
          <div className="shell why-grid">
            <div className="why-intro"><p className="eyebrow">Уважність у деталях</p><h2 id="why-title">Чому Mandra</h2><blockquote>«Поруч не лише до бронювання. Поруч у подорожі»</blockquote></div>
            <div className="reasons-list">
              {reasons.map((reason, index) => <article key={reason.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{reason.title}</h3><p>{reason.description}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="section support-section" id="support" aria-labelledby="support-title">
          <div className="shell support-card">
            <div className="support-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 42c9-6 15-14 15-23V9l-15-5L9 9v10c0 9 6 17 15 23Z" /><path d="m17 23 5 5 10-11" /></svg></div>
            <div><p className="eyebrow">Один контакт упродовж усієї подорожі</p><h2 id="support-title">Поруч, якщо щось пішло не за планом</h2><p className="support-lead">Підтримка Mandra не закінчується після оплати. Під час подорожі у вас залишається один зрозумілий контакт у Telegram. Ми допоможемо знайти потрібні документи, зв’язатися зі страховою або туроператором і зрозуміти, що робити далі.</p><div className="support-note"><strong>Планові питання: щодня, 09:00–19:00</strong><p>За київським часом. Якщо під час подорожі виникла термінова проблема поза цим графіком, напишіть нам у Telegram — терміновий канал залишається відкритим. У ситуаціях, що загрожують життю або здоров’ю, насамперед зверніться до місцевої екстреної служби.</p></div></div>
          </div>
        </section>

        <section className="section request-section" id="request" aria-labelledby="request-title">
          <div className="shell request-grid">
            <div><p className="eyebrow">Почнімо з вашої ідеї</p><h2 id="request-title">Розкажіть про майбутню подорож</h2><p className="request-copy">Тут з’явиться коротка форма заявки. Ви зможете вказати побажання, орієнтовні дати та зручний спосіб зв’язку.</p><p className="request-assurance"><span aria-hidden="true">✓</span>Точний напрямок і дати не будуть обов’язковими.</p></div>
            <div className="form-placeholder" aria-label="Місце майбутньої форми заявки"><div className="placeholder-route" aria-hidden="true"><span /><i /><span /></div><p>Форма заявки з’явиться на наступному етапі</p><span>Milestone 2</span></div>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="shell faq-grid">
            <div><p className="eyebrow">Коротко про важливе</p><h2 id="faq-title">Часті запитання</h2></div>
            <div className="faq-list">{faqItems.map((item, index) => <details key={item.question} open={index === 0}><summary><span>{item.question}</span><i aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
          </div>
        </section>

        <section className="closing-cta" aria-labelledby="closing-title">
          <div className="shell closing-inner"><RouteMark /><p className="eyebrow">Mandra Travel</p><h2 id="closing-title">Нехай складне планування стане легкою частиною подорожі.</h2><a className="button button-light" href="#request">Підібрати подорож<ArrowIcon /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-main">
          <a className="wordmark wordmark-light" href="#top" aria-label="Mandra Travel — на початок сторінки"><span className="wordmark-mark" aria-hidden="true">M</span><span>Mandra <i>Travel</i></span></a>
          <p>Персональні подорожі з людською підтримкою до, під час і після поїздки.</p>
          <nav aria-label="Навігація у футері"><a href="#how-it-works">Як це працює</a><a href="#journeys">Подорожі</a><a href="#support">Підтримка</a><a href="#faq">FAQ</a></nav>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Mandra Travel</span><span>Українська версія · дизайн для рев’ю</span></div>
      </footer>
    </>
  );
}
