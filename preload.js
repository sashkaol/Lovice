// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  // закрытие окна

  document.getElementById('exit').addEventListener('click', window.close);
  
  // подключение модуля хеширования паролей

  const bcrypt = require('bcrypt');

  // тут красиво пишется дата

function getDate(date){
  if(date instanceof Date) {
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      date: date
    };
  }else if(date === null || date === void 0){
    return null;
  }else{
    return date;
  }
}
const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря'
];

function humanDate(date) {
  let d = getDate(date);
  return [d.day, months[d.month], d.year].join(' ');
}

  // создание документа, подключение модуля для написания цифр прописью, открытие документа

  var rubles = require('rubles').rubles;
  const shell = require('electron').shell;
  var path = require('path');

  async function createDoc(fileName, data, inputFileName) {
    var PizZip = require('pizzip');
    var Docxtemplater = require('docxtemplater');

    var fs = require('fs');
    

      await new Promise((r,j)=>{
        fs.copyFile(
          'patterns/'+inputFileName,
          `contracts/${fileName}`, 
          (err, data)=>(
            (err?j:r)(data)
          )
        );
        
      });
      console.log('File copied');

      console.log(data);

      function replaceErrors(key, value) {
        if (value instanceof Error) {
          return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
          }, {});
        }
        return value;
      }
  
      function errorHandler(error) {
        console.log(JSON.stringify({ error: error }, replaceErrors));
  
        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
          }).join("\n");
          console.log('errorMessages', errorMessages);
        }
        throw error;
      }
  
      var content = fs
        .readFileSync(path.resolve(`contracts/${fileName}`), 'binary');
  
      var zip = new PizZip(content);
      var doc;
  
      try {
        doc = new Docxtemplater(zip);
      } catch (error) {
        errorHandler(error);
      }
      doc.setData({
        SecondPersonFullName: data.person_2['fullName'],
        FirstPersonFullName: data.person_1['fullName'],
        Place: data.club['clubName'],
        Datte: data.datte,
        Timme: data.timme,
        Letter: data.letter,
        DateCon: data.date_con,
        FinalCost: data.cost + ' руб.',
        FinalCostString: rubles(data.cost),
        services: data.services,
      });
  
      try {
        doc.render()

        var buf = doc.getZip()
        .generate({ type: 'nodebuffer' });
  
      fs.writeFileSync(path.resolve(`contracts/${fileName}`), buf);


      }
      catch (error) {
        errorHandler(error);
      }
  
     
}

// подключение MySql

const mysql = require('mysql');

var connection = mysql.createConnection ({
  host: "localhost",
  user: "root",
  password: "sashaoleneva1742",
  database: "Lovice"
});

// проверка подключения

connection.connect( (err) => {
  if (err) {
    console.log('no');
  } else {
    console.log('esss');
  }
});

// регистрация пользователя в системе

document.getElementById('registrate').addEventListener('click', () => {
  let errors = 0;
  // рабочий код, не трогать!
  let name = document.getElementById('name').value;
  if (/^[а-яё]+ [а-яё]+$/i.test(name) == false || name === '') {
    showMessage('error-name', 'Имя может содержать только русские буквы и пробелы');
    errors++
  }
  let login = document.getElementById('login').value;
  if (/^[a-z]+$/i.test(login) == false || login === '') {
    showMessage('error-login', 'Логин может содержать только английские буквы');
    errors++
  } else {
    connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Log_in = '${login}';`, (err, rez) => {
      if (rez[0]['Kolvo'] > 0) {
        showMessage('error-login', 'Этот логин уже занят!');
        errors++
      }
    })
  }
  let email = document.getElementById('email').value;
  if (email.includes('@') == false || email === '') {
    showMessage('error-email', 'Почта должна содержать значок @');
    errors++
  } 
  let gender = document.getElementsByName('gender');
  let pol;
  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) {
      pol = gender[i].value;
      break;
    }
  }
  let phone = document.getElementById('phone').value;
  if (/^(\+7|7|8)[0-9]{3}[0-9]{3}[0-9]{2}[0-9]{2}$/.test(phone) == false || phone === '') {
    showMessage('error-phone', 'Перепроверьте введенный номер, он должен соответстовать шаблону 80000000000 или +70000000000');
    errors++
  } 
  let birthday = document.getElementById('birthday').value;
  let birthdayDate = new Date(birthday);
    let nowDate = new Date();
    if (birthdayDate.getFullYear() > nowDate.getFullYear()) {
      showMessage('error-date', 'Вы не можете родиться в будущем!');
      errors++
    } else if (nowDate.getFullYear()-birthdayDate.getFullYear() > 100) {
      showMessage('error-date', 'Вы не можете быть старше 100 лет, вы что тут делаете...');
      errors++
    } else if (nowDate.getFullYear()-birthdayDate.getFullYear() < 16) {
      showMessage('error-date', 'Детям вход запрещен!');
      errors++
    } 
  let about = document.getElementById('about_me').value; 
  if (about === '') {
    showMessage('error-about', 'Эй, напишите о себе! Мы любим знакомиться с людьми поближе!');
    errors++
  } 
  let password = document.getElementById('password').value;
  if (password.length < 10) {
    showMessage('error-enter-pass', 'Пароль ненадежен: он должен быть длиной более 10 символов');
    errors++
  } 
  let salt = bcrypt.genSaltSync(1);
  password = bcrypt.hashSync(password, salt);
  console.log(password);
  let password_repeat = document.getElementById('password_repeat').value;
  password_repeat = bcrypt.hashSync(password_repeat, salt);
  console.log(password_repeat);
  if (password != password_repeat) {
    showMessage('error-password', 'Пароли не совпадают');
    errors++
  }

    if (errors <= 0) {
      let query = '';
      query = `INSERT INTO Lovice.Users VALUES (NULL, '${login}', '${password}', '${salt}', '${name}', '${email}', '${phone}', '${birthday}', '${pol}', '${about}', 'user', NULL);`;
      connection.query(query, (err, rez) => {
        if (err) {
          console.log(err);
        } else  {
          clearInputs();
          showMessage('success-reg', 'Вы успешно зарегистрировались!');
        }
      })
    }
})

// описание каких-то глобальных переменных, которые потом понадобятся (должны)

var this_login = '';
var this_password = '';
var this_salt = '';
var user_password = '';
var id_user;
var inputs = document.querySelectorAll('input:not([type=checkbox]):not([type=radio])');
var textareas = document.querySelectorAll('textarea');

// чистка инпутов 

function clearInputs() {
  inputs.forEach(el => {
    el.value = '';
  });
  textareas.forEach(el => {
    el.value = '';
  })
}

let thisUserName; // очень важная переменная, хранящая текущее имя

// открытие профиля вошедшего пользователя

function openUserProfile() {
  document.getElementById('hello-page').classList.add('close');
  document.getElementById('profile-info').classList.remove('close');
  connection.query(`SELECT Users.Id, Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.Phone_Number, Users.About_me, Users.Gender, Users.Level FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      id_user = rez[0]['Id'];
      console.log('id ' + id_user);
      document.getElementById('profile-text').innerHTML = `<div><span class="main-info">Мое имя:</span> ${rez[0]['Full_Name']}</div><br/>
            <div><span class="main-info">Мой возраст:</span> ${ageCalc(rez[0]['Age'])}</div><br/>
            <div><span class="main-info">Мой номер телефона:</span> ${rez[0]['Phone_Number']}</div><br/>
            <div><span class="main-info">Обо мне:</span> ${rez[0]['About_me']}</div>`;
      var photo_title;
      thisUserName = rez[0]['Full_Name'];
      if (rez[0]['Gender'] == 'female') {
        console.log(rez[0]['Gender']);
        photo_title = 'img/woman-1.svg';
      } else {
        console.log(rez[0]['Gender']);
        photo_title = 'img/man-1.svg';
      }
      document.getElementById('profile-photo').innerHTML = `<div><img class="img" src="${photo_title}" alt="profile-photo" /</div>`;
      if (rez[0]['Level'] == 'admin') {
        document.getElementById('admin-tools').classList.remove('tools-close');
      } else {
        document.getElementById('user-tools').classList.remove('tools-close');
      }
    }
  })
  
}

// выход из профиля

function exitFromProfile() {
  document.getElementById('profile-text').innerHTML = '';
  document.getElementById('profile-photo').innerHTML = ''; 
  document.getElementById('profile-page').classList.add('close');
  connection.query(`SELECT Users.Level FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      if (rez[0]['Level'] == 'admin') {
        document.getElementById('admin-tools').classList.add('tools-close');
      } else{
        document.getElementById('user-tools').classList.add('tools-close');
      }
    }
  });
  connection.query(`UPDATE Lovice.Users SET Users.User_online = NULL WHERE Users.Log_in = '${this_login}';`);
  this_login = '';
  document.getElementById('navigate-list').classList.remove('close');
  document.getElementById('enter').addEventListener('click', enterWithLogin);
}

document.getElementById('exit-profile-admin').addEventListener('click', exitFromProfile); // клац

document.getElementById('exit-profile-user').addEventListener('click', exitFromProfile); // клац-клац

// автоматический вход

function automaticEnter(){
  connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.User_online = 'online';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      console.log(rez);
      if (rez[0]['Kolvo'] == 1) {
        connection.query(`SELECT Users.Log_in FROM Lovice.Users WHERE Users.User_online = 'online';`, (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            this_login = rez[0]['Log_in'];
            console.log(this_login);
            document.getElementById('hello-page').classList.remove('close');
            document.getElementById('profile-page').classList.remove('close');
            document.getElementById('profile-info').classList.add('close');
            document.getElementById('sign-in-page').classList.add('close');
            setTimeout(openUserProfile, 2000);
          }
        })
      } else {
        document.getElementById('navigate-list').classList.remove('close');
        document.getElementById('enter').addEventListener('click', enterWithLogin);
      }
    }
  })
}

window.addEventListener('DOMContentLoaded', automaticEnter()); // загрузка профиля при открытии окна

// проверка последнего пользователя

function setOnline() {
  connection.query(`UPDATE Lovice.Users SET Users.User_online = 'online' WHERE Users.Log_in = '${this_login}';`);
}

// вход с паролем

function enterWithLogin() {
  document.getElementById('error-enter').classList.add('close');
  console.log(this_login);
  this_login = document.getElementById('ent-login').value;
  this_password = document.getElementById('ent-pass').value;
  console.log(this_login);
  connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else if (rez[0]['Kolvo'] == 1) {
      connection.query(`SELECT Users.Salt FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
        if (err) {
          console.log(err);
        } else {         
          this_salt = rez[0]['Salt'];
          console.log(this_salt);
          this_password = bcrypt.hashSync(this_password, this_salt);
          connection.query(`SELECT Users.Pass_word FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
            if (err) {
              console.log(err);
            } else {
              user_password = rez[0]['Pass_word'];
              console.log(user_password);
              if (this_password != user_password) {
                console.log('Неверное имя пользователя или пароль');
                showMessage('error-enter', 'Неверное имя пользователя или пароль!');
              } else {
                document.getElementById('hello-page').classList.remove('close');
                document.getElementById('sign-in-page').classList.add('close');
                document.getElementById('profile-page').classList.remove('close');
                document.getElementById('profile-info').classList.add('close');
                setOnline();
                setTimeout(openUserProfile, 2000);
              }
            }
          })
        }
      })
    } else if (rez[0]['Kolvo'] == 0) {
      showMessage('error-enter', 'Пользователь не найден!');
    }
  })
}

var user_age; // очень нужные переменные
var user_name;
var user_about;

function ageCalc(user_age) {
  if (user_age >= 5 && user_age <= 20) {
    return user_age + ' лет';
  } else if ((user_age%10 === 0) || ((user_age%10 >= 5) && (user_age%10 <= 9))) {
    return user_age + ' лет';
  } else if (user_age%10 === 1) {
    return user_age + ' год';
  } else if ((user_age%10 >= 2) && (user_age%10 <= 4)) {
    return user_age + ' года';
  }
}

let id_2;

  // открытие каталога пользователей

  function renderCatalog() {
    deleteCatalog('catalog-page-cards');
    connection.query(`SELECT COUNT (*) AS 'Kol_vo' FROM Lovice.Users WHERE Users.Level <> 'admin' AND Users.Log_in <> '${this_login}';`, (err, rez) => {
      if (err) {
        console.log(err);
      } else {
        let kolvo = rez[0]['Kol_vo'];
        connection.query(`SELECT Users.Id, Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.About_me FROM Lovice.Users WHERE Users.Level <> 'admin' AND Users.Log_in <> '${this_login}';`, (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            for (let i = 0; i < kolvo; i++) {
              user_name = rez[i]['Full_Name'];
              user_age = rez[i]['Age'];
              user_about = rez[i]['About_me'];
              let catalog_card = document.createElement('div');
              catalog_card.innerHTML = `<div id="user-${i}" class="catalog-card"><div id="user-name-${i}" class="user-info">${user_name}</div><div class="user-info">${ageCalc(user_age)}</div><div class="user-info big">${user_about}</div><div class="user-buts"><button id='to-contract-${i}' class="user-but like"><img class="likes" src="img/facebook-like.png"></div></div>`;
              document.getElementById("catalog-page-cards").appendChild(catalog_card);
              document.getElementById(`to-contract-${i}`).addEventListener('click', () => {
                createContract(rez[i]['Id'], `user-name-${i}`);
                id_2 = rez[i]['Id'];
              })
            }
          }
        })  
      }
    })
  }

  // отмена заключения договора

  document.getElementById('cancel-contract-but').addEventListener('click', () => {
    clearInputs();
    id_2 = '';
    document.getElementById('create-contract-page').classList.add('close');
    document.getElementById('profile-page').classList.remove('close');
  })

  let secondPers = '';

  // открытие страницы заключения договора

  function createContract(id, person) {
    console.log(id, person);
    document.getElementById('this-user-name').innerHTML = `${thisUserName}`;
    secondPers = document.getElementById(person).textContent;
    document.getElementById('person').innerHTML = secondPers;
    document.getElementById('create-contract-page').classList.remove('close');
    document.getElementById('catalog-page').classList.add('close');
    openServiceList();
    openClubList();
  }

  // объект для всех необходимых данных при создании договора

  let allData =
      {
        date_con: '',
        person_1: {
          id: '',
          fullName: ''
        },
        person_2: {
          id: '',
          fullName: ''
        },
        datte: '',
        timme: '',
        club: {
          id: '',
          clubName: '',
        },
        services: [],
        cost: 0,
        letter: '',
      }
      

  document.getElementById('create-contract-but').addEventListener('click', getDataForContracts); // клац и получили данные да еще и создали документ

  function getDataForContracts() {
    let errors = 0;
    allData.person_1['id'] = id_user;
    allData.person_1['fullName'] = thisUserName;
    allData.person_2['fullName'] = secondPers;
    allData.person_2['id'] = id_2;
    let clubs = document.getElementsByName('club');
    for (let i = 0; i < clubs.length; i++) {
      if (clubs[i].checked) {
        allData.club['id'] = clubs[i].value;
        allData.club['clubName'] = clubs[i].getAttribute('data-clubName');
      break;
      }
    }
    if (allData.club['id'] === '' || allData.club['id'] == undefined) {
      showMessage('error-club-contract', 'Выберите место!');
      errors++
    }
    let services = document.getElementsByName('services');
    let num = 1;
    for (let i = 0; i < services.length; i++) {
      let servicesList = {
        id: '',
        servName: '',
        cost: 0,
        i: num
      }
      if (services[i].checked) {
        servicesList.id = services[i].value;
        servicesList.servName = services[i].getAttribute('data-servName');
        servicesList.cost = services[i].getAttribute('data-cost');
        
        allData.services.push(servicesList);

        allData.cost += parseFloat(services[i].getAttribute('data-cost'));
        num++
      }
    }
    if (allData.services == '' || allData.services == undefined) {
      showMessage('error-serv-contract', 'Выберите хотя бы одну услугу!');
      errors++
    }
    document.getElementById('all-cost').innerHTML = allData.cost + ' руб.';
    allData.timme = document.getElementById('time-meet').value;
    if (allData.timme === '' || allData.timme == undefined) {
      showMessage('error-timme', 'Укажите время!');
      errors++
    }
    allData.datte = document.getElementById('date-meet').value;
    if (allData.datte === '' || allData.datte == undefined) {
      showMessage('error-datte', 'Укажите дату!');
      errors++
    } else if (new Date(allData.datte) < new Date()) {
      showMessage('error-datte', 'В целях сохранения временной линии свидания в прошлом запрещены Теневой Прокламацией');
      errors++
    }
    allData.letter = document.getElementById('letter').value;
    if (allData.letter === '') {
      showMessage('error-letter', 'Отправьте сообщение пользователю!');
      errors++
    }
    allData.date_con = humanDate(new Date());
    console.log(allData);
    if (errors === 0) {
      var d = new Date();
      var theDate = [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')+'_'+[d.getHours(), d.getMinutes(), d.getSeconds()].join('-')+'.'+d.getMilliseconds()
      

      let fileInvite = 'Invite-Lovice_' + theDate + '.docx';
      let fileContract = 'Contract-Lovice_' + theDate + '.docx';
    createDoc(fileInvite, allData, 'Lovice-invite.docx');
    createDoc(fileContract, allData, 'Lovice-Contract.docx');
    showMessage('success-contract', 'Договор и приглашение успешно созданы! Переход в профиль совершится автоматически через несколько секунд...');
    let now = new Date();
    var theDate = [now.getFullYear(), now.getMonth()+1, now.getDate()].join('-');
    console.log(theDate);
    console.log(`INSERT INTO Lovice.Contracts VALUES (NULL, ${allData.person_1['id']}, ${allData.person_2['id']}, '${allData.datte}', '${allData.datte}', ${allData.club['id']}, ${allData.cost}, ${new Date()});`);
    connection.query(`INSERT INTO Lovice.Contracts VALUES (NULL, ${allData.person_1['id']}, ${allData.person_2['id']}, '${allData.datte}', '${allData.timme}', ${allData.club['id']}, ${allData.cost}, '${theDate}');`, (err, rez) => {
      if (err) console.log(err) 
      else
      if (!err) {
        console.info(rez);
        allData.services.forEach(function(service){
          connection.query(`INSERT INTO Lovice.Services_list (Id_contract, Id_service) VALUES (?,?)`, [rez.insertId, service.id])
        })
        
      }
    })
    setTimeout(() => {
      document.getElementById('profile-page').classList.remove('close');
      document.getElementById('create-contract-page').classList.add('close');
      clearInputs();
      document.getElementById('all-cost').innerHTML = '';
      clubs.forEach(el => {
        el.checked = false;
      })
      services.forEach(el => {
        el.checked = false;
      })
      id_2 = '';
      // shell.openPath(path.resolve(`contracts/${fileInvite}`));
      // shell.openPath(path.resolve(`contracts/${fileContract}`));
      allData =
      {
        date_con: '',
        person_1: {
          id: '',
          fullName: ''
        },
        person_2: {
          id: '',
          fullName: ''
        },
        datte: '',
        timme: '',
        club: {
          id: '',
          clubName: '',
        },
        services: [],
        cost: 0,
        letter: '',
      }
    }, 3000)
  } else allData.services = [];
}

  document.getElementById('to-profile-from-docx').addEventListener('click', () => {
    document.getElementById('my-docx').classList.add('close');
    document.getElementById('profile-page').classList.remove('close');
  })

  document.getElementById('to-docx').addEventListener('click', () => {
    deleteCatalog('my-docx-list');
    document.getElementById('my-docx').classList.remove('close');
    document.getElementById('profile-page').classList.add('close');
    connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Contracts WHERE Contracts.Person_1 = ${id_user};`, (err, rez) => {
      let kolvo = rez[0]['Kolvo'];
      connection.query(`SELECT * FROM Lovice.Contracts WHERE Contracts.Person_1 = ${id_user};`, (err, rez) => {
        for (let i = 0; i < kolvo; i++) {
          let contractItem = document.createElement('div');
          contractItem.innerHTML = `<div class="item">
          <div class="labels">Договор ${rez[i]['Id']}</div>
          <div class="labels"> от ${humanDate(rez[i]['Date_con'])}</div>
          <div class="labels"> на сумму ${rez[i]['Cost']} руб.</div>
          <button id="save-contract-num-${rez[i]['Id']}" class="user-but like">Сохранить документ</button>
          </div>`
          document.getElementById('my-docx-list').appendChild(contractItem);
          document.getElementById(`save-contract-num-${rez[i]['Id']}`).addEventListener('click', () => {
            createOldDocx(rez[i]['Id']);
          })
        }
      })
    })
  })

  function createOldDocx(id) {
    var allData = {
      date_con: '',
        person_1: {
          id: '',
          fullName: ''
        },
        person_2: {
          id: '',
          fullName: ''
        },
        datte: '',
        timme: '',
        club: {
          id: '',
          clubName: '',
        },
        services: [],
        cost: 0,
        letter: '',
    };
    connection.query(`SELECT * FROM Lovice.Contracts WHERE Contracts.Id = ${id};`, (err, rez) => {
      allData.cost = rez[0]['Cost'];
      connection.query(`SELECT Users.Full_Name FROM Lovice.Users, Lovice.Contracts WHERE Users.Id = Contracts.Person_1 AND Contracts.Id = ${id};`, (err, rez) => {
        allData.person_1['fullName'] = rez[0]['Full_Name'];
      })
      connection.query(`SELECT Users.Full_Name FROM Lovice.Users, Lovice.Contracts WHERE Users.Id = Contracts.Person_2 AND Contracts.Id = ${id};`, (err, rez) => {
        allData.person_2['fullName'] = rez[0]['Full_Name'];
      })
      allData.date_con = humanDate(rez[0]['Date_con']);
      allData.timme = rez[0]['Timme'];
      allData.datte = rez[0]['Datte'];
      connection.query(`SELECT Clubs.Club_name FROM Lovice.Clubs, Lovice.Contracts WHERE Clubs.Id = Contracts.Club AND Contracts.Id = ${id}`, (err, rez) => {
        allData.club['clubName'] = rez[0]['Club_name'];
      })
      connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Services_list WHERE Services_list.Id_contract = ${id};`, (err, rez) => {
        let kolvo = rez[0]['Kolvo'];
        let num = 1;
        connection.query(`SELECT Services.ServiceName, Services.Cost FROM Lovice.Services, Lovice.Services_list, Lovice.Contracts WHERE Services_list.Id_service = Services.Id AND Contracts.Id = Services_list.Id_contract AND Contracts.Id = ${id};`, (err, rez) => {
          for (let i = 0; i < kolvo; i++) {
            let servicesList = {
              servName: '',
              cost: 0,
              i: num
            }
            servicesList.servName = rez[i]['ServiceName'];
            servicesList.cost = rez[i]['Cost'];
            allData.services.push(servicesList);
            num++
          }
        })
      })
    })
    console.log(allData);
    var d = new Date();
      var theDate = [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')+'_'+[d.getHours(), d.getMinutes(), d.getSeconds()].join('-')+'.'+d.getMilliseconds()
      let fileContract = 'Contract-Lovice_' + theDate + '.docx';  
    showMessage('success-create-old', 'Ваш старый договор успешно сохранен на ваш компьютер!');
    setTimeout( ()=> {
      createDoc(fileContract, allData, 'Lovice-Contract.docx');


      document.getElementById('my-docx').classList.add('close');
      document.getElementById('profile-page').classList.remove('close');
    }, 3000)
  }


  // список услуг красивенький и список заведений, тоже красивенький

  function openServiceList() {
    connection.query(`SELECT COUNT (*) AS 'KOLVO' FROM Lovice.Services;`, (err, rez) => {
      let kolvo = rez[0]['KOLVO'];
      connection.query(`SELECT Services.Id, Services.ServiceName, Services.Description, Services.Cost FROM Lovice.Services;`, (err, rez) => {
        for (let i = 0; i < kolvo; i++) {
          let serviceItem = document.createElement('div');
          serviceItem.innerHTML = `<div class="item">
            <div class="name-form">${rez[i]['ServiceName']}</div>
            <div class="desc-form">${rez[i]['Description']}</div>
            <div>${rez[i]['Cost']} руб.</div>
            <input type="checkbox" name="services" value="${rez[i]['Id']}" class="but radio-club" data-cost="${rez[i]['Cost']}" data-servName="${rez[i]['ServiceName']}"></input>
          </div>`
          document.getElementById('services-for-contract').appendChild(serviceItem);
        }
      })
    })
  }

  function openClubList() {
    connection.query(`SELECT COUNT (*) AS 'KOLVO' FROM Lovice.Clubs;`, (err, rez) => {
      let kolvo = rez[0]['KOLVO'];
      connection.query(`SELECT Clubs.Id, Clubs.Club_name, Clubs.Description, Clubs.Adress FROM Lovice.Clubs;`, (err, rez) => {
        for (let i = 0; i < kolvo; i++) {
          let serviceItem = document.createElement('div');
          serviceItem.innerHTML = `<div class="item">
            <div class="name-form">${rez[i]['Club_name']}</div>
            <div class="desc-form">${rez[i]['Description']}</div>
            <div class="adres-form">${rez[i]['Adress']}</div>
            <div class="radio-input-wrap">
            <input value="${rez[i]['Id']}" type="radio" name="club" data-clubName="${rez[i]['Club_name']}" class="radio-club but add-serv" id="add-club-${i}"></input></div>
          </div>`;
          document.getElementById('club-for-contract').appendChild(serviceItem);
        }
      })
    })
  }

  // удаление любого каталога, вообще любого

  function deleteCatalog(id) {
    let arr = document.getElementById(id);
    while (arr.firstChild) {
      arr.removeChild(arr.lastChild);
    }
  }

  document.getElementById('search-but').addEventListener('click', () => {
    document.getElementById('catalog-page').classList.remove('close');
    document.getElementById('profile-page').classList.add('close');
    renderCatalog();
  })

  // каталог для мониторинга всех пользователей

function openCatalogForAdmins() {
  connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.Log_in <> '${this_login}' AND Users.Level = 'admin';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      let kolvo = rez[0]['Kolvo'];
      console.log(rez);
      connection.query(`SELECT * FROM Lovice.Users WHERE Users.Log_in <> '${this_login}' AND Users.Level = 'admin';`, (err, rez) => {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < kolvo; i++) {
          let allCatalogCard = document.createElement('div');
          allCatalogCard.innerHTML = `
          <div id="admin-${i}" class="catalog-card adm">
          <span class="user-info for-adm">${rez[i]['Log_in']}</span>
          <span class="user-info for-adm">${rez[i]['Full_Name']}</span>
          <span class="user-info for-adm">${rez[i]['Email']}</span>
          <span class="user-info for-adm">${rez[i]['Phone_Number']}</span>
          <span class="user-info big for-adm">${rez[i]['Birthday']}</span>
          <span class="user-info for-adm">${rez[i]['Gender']}</span>
          <span class="user-info big for-adm">${rez[i]['About_me']}</span>
          <div class="user-buts">
          <button id="make-user-${i}" class="user-but like adm-but">В пользователи</button>
          </div>
          </div>
          `;
          document.getElementById('admin-pages').appendChild(allCatalogCard);
          document.getElementById(`make-user-${i}`).addEventListener('click', () => {
            makeUser(rez[i]['Id']);
          });
        }
        connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.Level = 'user';`, (err, rez) => {
          kolvo = rez[0].Kolvo;
          connection.query("SELECT * FROM Lovice.Users WHERE Users.Level = 'user';", (err, rez) => {
            for (let i = 0; i < kolvo; i++) {
              let allCatalogCard = document.createElement('div');
              allCatalogCard.innerHTML = `
              <div id="user-${i}" class="catalog-card adm">
              <span class="user-info for-adm log-for-adm-${i}">${rez[i]['Log_in']}</span>
              <span class="user-info for-adm">${rez[i]['Full_Name']}</span>
              <span class="user-info for-adm">${rez[i]['Email']}</span>
              <span class="user-info for-adm">${rez[i]['Phone_Number']}</span>
              <span class="user-info big for-adm">${rez[i]['Birthday']}</span>
              <span class="user-info for-adm">${rez[i]['Gender']}</span>
              <span class="user-info big for-adm">${rez[i]['About_me']}</span>
              <div class="user-buts">
              <button id="make-admin-${i}" class="user-but like adm-but">В админы</button>
              </div>
              </div>`
              document.getElementById('user-pages').appendChild(allCatalogCard);
              document.getElementById(`make-admin-${i}`).addEventListener('click', () => {
                makeAdmin(rez[i]['Id']);
              });
            }
          })
        })
      }
    })
    }
  })
}

// манипуляции с бедными пользователями

function makeAdmin(id) {
  connection.query(`UPDATE Lovice.Users SET Users.Level = 'admin' WHERE Users.Id = '${id}';`);
  deleteCatalog('admin-pages');
  deleteCatalog('user-pages');
  openCatalogForAdmins();
}

function makeUser(id) {
  connection.query(`UPDATE Lovice.Users SET Users.Level = 'user' WHERE Users.Id = '${id}';`);
  deleteCatalog('admin-pages');
  deleteCatalog('user-pages');
  openCatalogForAdmins();
}

document.getElementById('users-notice').addEventListener('click', () => {
  document.getElementById('all-users').classList.remove('close');
  document.getElementById('profile-page').classList.add('close');
  openCatalogForAdmins();
});

document.getElementById('to-profile-from-alls').addEventListener('click', () => {
  document.getElementById('profile-page').classList.remove('close');
  document.getElementById('all-users').classList.add('close');
  deleteCatalog('admin-pages');
  deleteCatalog('user-pages');
})
  
// формирование страницы услуг

function servicesPageCreate() {
  connection.query(`SELECT COUNT(*) AS 'Kolvo' FROM Lovice.Services;`, (err, rez) => {
    if (err) {
      console.log('no');
    } else {
        console.log(rez[0]['Kolvo']);
        let kolvo = rez[0]['Kolvo'];
        connection.query(`SELECT Services.ServiceName, Services.Cost, Services.Description FROM Lovice.Services;`, (err, rez) => {
          if (err) {
            console.log('damn');
          } else {
            console.log(rez);
            for (let i = 0; i < kolvo; i++ ) {
              str = rez[i]['ServiceName'];
              let cost = rez[i]['Cost'];
              let desc = rez[i]['Description'];
              let card = document.createElement('div');
              card.innerHTML = `<div id="service-${i}" class="card"><span class="title">${str}</span><div id="service-desc-${i}" class="descript hidden">${desc}</div><div class="buy"><b>${cost} руб.</b></div></div>`;
              document.getElementById('service-list').appendChild(card);
            }  
            for (let i = 0; i < kolvo; i++) {
              document.getElementById(`service-${i}`).addEventListener('mouseover', () => {
                document.getElementById(`service-desc-${i}`).classList.remove('hidden');
                document.getElementById(`service-desc-${i}`).classList.add('visible');
              })
              document.getElementById(`service-${i}`).addEventListener('mouseout', () => {
                document.getElementById(`service-desc-${i}`).classList.remove('visible');
                document.getElementById(`service-desc-${i}`).classList.add('hidden');
              })
            }       
          }
        });
    }
  });
}

// очень хороший поиск с отрисовкой результатов

  document.getElementById('search-but-main').addEventListener('click', () => {
    if (this_login === '') {
      console.log(this_login);
      showMessage('error-search', 'Авторизуйтесь в системе!');
    } else {
      let search = document.getElementById('search-input').value;
      if (search === '') {
        showMessage('error-search', 'Введите ваш запрос!');
      } else {
        deleteCatalog('search-users');
        deleteCatalog('search-services');
        deleteCatalog('search-clubs');
        document.getElementById('search-page').classList.remove('close');
      document.getElementById('profile-page').classList.add('close');
      connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.Full_Name LIKE CONCAT('%', ?, '%') OR Users.Log_in LIKE  CONCAT('%', ?, '%') OR Users.About_me LIKE CONCAT('%', ?, '%') AND Users.Level <> 'admin';`, [search, search, search], (err, rez) => {
        let kolvo = rez[0]['Kolvo'];
        connection.query(`SELECT Users.Log_in, Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.About_me FROM Lovice.Users WHERE Users.Full_Name LIKE CONCAT('%', ?, '%') OR Users.Log_in LIKE  CONCAT('%', ?, '%') OR Users.About_me LIKE CONCAT('%', ?, '%') AND Users.Level <> 'admin';`, [search, search, search], (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            console.log(rez);
                    if (kolvo > 0) {
                      document.getElementById('search-users').innerHTML = '<span class="hello-user search-l s-u">Пользователи</span>';
                      for (let i = 0; i < kolvo; i++) {
                        let user = document.createElement('div');
                        user.innerHTML = `<div class="item search-item">
                      <div class="name-form">${rez[i]['Full_Name']}</div>
                      <div class="desc-form">${rez[i]['Log_in']}</div>
                      <div class="adres-search">${ageCalc(rez[i]['Age'])}</div>
                      <div class="adres-search">${rez[i]['About_me']}</div>
                      </div>`;
                      document.getElementById('search-users').appendChild(user);
                      }
                    } else {
                      document.getElementById('search-users').innerHTML = '<span class="hello-user search-l">Пользователи не найдены</span>';
                    }
            connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Services WHERE Services.ServiceName LIKE CONCAT('%', ?, '%');`, [search], (err, rez) => {
              let kolvo = rez[0]['Kolvo'];
              connection.query(`SELECT * FROM Lovice.Services WHERE Services.ServiceName LIKE CONCAT('%', ?, '%');`, [search], (err, rez) => {
                if (err) {
                  console.log(err);
                } else {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(rez);
                    if (kolvo > 0) {
                      document.getElementById('search-services').innerHTML = '<span class="hello-user search-l">Услуги</span>';
                      for (let i = 0; i < kolvo; i++) {
                        let serv = document.createElement('div');
                        serv.innerHTML = `<div class="item search-item">
                      <div class="name-form">${rez[i]['ServiceName']}</div>
                      <div class="desc-form">${rez[i]['Description']}</div>
                      <div class="adres-search">${rez[i]['Cost']} руб.</div>
                      </div>`;
                      document.getElementById('search-services').appendChild(serv);
                      }
                    } else {
                      document.getElementById('search-services').innerHTML = '<span class="hello-user search-l">Услуги не найдены</span>';
                    }
                    
                  }
                  connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Clubs WHERE Clubs.Club_name LIKE  CONCAT('%', ?, '%');`, [search], (err, rez) => {
                    console.log(rez[0]['Kolvo']);
                    let kolvo = rez[0]['Kolvo'];
                    connection.query(`SELECT * FROM Lovice.Clubs WHERE Clubs.Club_name LIKE  CONCAT('%', ?, '%');`, [search], (err, rez) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(rez);
                        if (kolvo > 0) {
                          document.getElementById('search-clubs').innerHTML = '<span class="hello-user search-l">Заведения</span>';
                          for (let i = 0; i < kolvo; i++) {
                            let club = document.createElement('div');
                            club.innerHTML = `<div class="item search-item">
                          <div class="name-form">${rez[i]['Club_name']}</div>
                          <div class="desc-form">${rez[i]['Description']}</div>
                          <div class="adres-search">${rez[i]['Adress']}</div>
                          </div>`;
                          document.getElementById('search-clubs').appendChild(club);
                          }
                        } else {
                          document.getElementById('search-clubs').innerHTML = '<span class="hello-user search-l">Заведения не найдены</span>';
                        } 
                        
                      }
                    })
                  })
                }
              })
            }) 
          }
        })
      })
      }
    }
  })

  document.getElementById('to-profile-from-search').addEventListener('click', () => {
    document.getElementById('profile-page').classList.remove('close');
    document.getElementById('search-page').classList.add('close');
    clearInputs();
  })

  // удаление профиля по клацу

document.getElementById('delete-profile-user').addEventListener('click', () => {
  document.getElementById('profile-page').classList.add('close');
  document.getElementById('delete-profile-page').classList.remove('close');
  document.getElementById('come-back').addEventListener('click', () => {
    document.getElementById('profile-page').classList.remove('close');
    document.getElementById('delete-profile-page').classList.add('close');
  })
  document.getElementById('delete-profile').addEventListener('click', () => {
    connection.query(`INSERT INTO Lovice.Archive SELECT * FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
      if (err) {
        console.log(err);
      } else {
        connection.query(`UPDATE Lovice.Archive SET Archive.User_online = NULL;`);
        connection.query(`DELETE FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            document.getElementById('delete-buts').classList.add('close');
            showMessage('success-delete', 'Ваш профиль успешно удален, ждем вас снова! :(');
            setTimeout(() => {
              document.getElementById('delete-profile-page').classList.add('close');
              document.getElementById('navigate-list').classList.remove('close');
            }, 3000)
          }
        })
      }
    })
  })
})

// формирование страницы клубов

function clubsPageCreate() {
  connection.query(`SELECT COUNT(*) AS 'Kolvo' FROM Lovice.Clubs`, (err, rez) => {
    if (err) {
      console.log('damn');
    } else {
      kolvo = rez[0]['Kolvo'];
      connection.query(`SELECT Clubs.Club_name, Clubs.Adress, Clubs.Description FROM Lovice.Clubs;`, (err, rez) => {
        if (err) {
          console.log('damn');
        } else {
          for (let i = 0; i < kolvo; i++) {
            str = rez[i]['Club_name'];
            let adres = rez[i]['Adress'];
            let desc = rez[i]['Description'];
            let card = document.createElement('div');
            card.innerHTML = `<div id="club-${i}" class="club card"><span class="title">"${str}"</span><span class="adres">${adres}</span><div id="club-desc-${i}" class="descript hidden">${desc}</div></div>`;
            document.getElementById('clubs-list').appendChild(card);
  
          }
          for (let i = 0; i < kolvo; i++) {
            document.getElementById(`club-${i}`).addEventListener('mouseover', () => {
              document.getElementById(`club-desc-${i}`).classList.remove('hidden');
              document.getElementById(`club-desc-${i}`).classList.add('visible');
            })
            document.getElementById(`club-${i}`).addEventListener('mouseout', () => {
              document.getElementById(`club-desc-${i}`).classList.remove('visible');
              document.getElementById(`club-desc-${i}`).classList.add('hidden');
            })
          }
        }
      })
    }
  })
}

// добавление новой услуги

function editServices() {
  let error = 0;
  let serviceName = document.getElementById('service-name-input').value;
  if (serviceName === '') {
    showMessage('error-servName', 'Название услуги не может быть пустым');
    error++
  }
  let serviceCost = document.getElementById('service-cost-input').value;
  if (serviceCost.includes('[^0-9]') || serviceName === '') {
    showMessage('error-cost', 'Цена не может быть пустой и не может включать в себя буквы');
    error++
  }
  let serviceDesc = document.getElementById('service-desc-input').value;
  if (serviceDesc === '') {
    showMessage('error-descServ', 'Описание услуги должно быть введено обязательно!');
    error++
  }
  if (error === 0) {
    connection.query(`INSERT INTO Lovice.Services VALUES (NULL, '${serviceName}', '${serviceCost}', '${serviceDesc}');`, (err) => {
      if (err) {
        console.log(err);
      } else {
        clearInputs();
        showMessage('success-add-serv', 'Услуга успешно добавлена!');
      }
    });
  }
  
}

// добавление нового клуба

function editClubs() {
  let errors = 0;
  let clubName = document.getElementById('club-name-input').value;
  if (clubName === '') {
    showMessage('error-clubName', 'Название заведения не может быть пустым');
    errors++
  }
  let clubAdr = document.getElementById('club-address-input').value;
  if (clubAdr === '') {
    showMessage('error-clubAdr', 'Адрес не может быть пустым');
    errors++
  }
  let clubDesc = document.getElementById('club-desc-input').value;
  if (clubDesc === '') {
    showMessage('error-clubDesc', 'Описание заведения должно быть введено обязательно!');
    errors++
  }
  if (errors === 0) {
    connection.query(`INSERT INTO Lovice.Clubs VALUES (NULL, '${clubName}', '${clubAdr}', '${clubDesc}');`, (err) => {
      if (err) {
        console.log(err);
      } else {
        clearInputs();
        showMessage('success-add-club', 'Заведение успешно добавлено!');
      }
    });
  }
}

document.getElementById('to-profile-from-chc').addEventListener('click', () => {
  clearInputs();
  document.getElementById('change-clubs-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
})

document.getElementById('to-profile-from-chs').addEventListener('click', () => {
  clearInputs();
  document.getElementById('change-services-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
})

// очень важная функция создания сообщений об ошибках

function showMessage(id, text) {
  let block = document.getElementById(id);
  block.classList.remove('close');
  block.innerHTML = text;
  setTimeout(() => {
    block.classList.add('close');
  }, 3000);
}

// тут переключения страниц, т.к. электрон не позволяет делать многостраничные приложения, пришлось ставить класс close

document.getElementById('to-profile-from-catalog').addEventListener('click', () => {
  document.getElementById('catalog-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
})

document.getElementById('add-service').addEventListener('click', editServices);
document.getElementById('add-club').addEventListener('click', editClubs);

document.getElementById('change-services').addEventListener('click', () => {
  document.getElementById('profile-page').classList.add('close');
  document.getElementById('change-services-page').classList.remove('close');
})

document.getElementById('change-clubs').addEventListener('click', () => {
  document.getElementById('profile-page').classList.add('close');
  document.getElementById('change-clubs-page').classList.remove('close');
})

document.getElementById('view-services').addEventListener('click', () => {
  document.getElementById('service-page').classList.remove('close');
  servicesPageCreate();
  document.getElementById('change-services-page').classList.add('close');
})

document.getElementById('view-clubs').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.remove('close');
  clubsPageCreate();
  document.getElementById('change-clubs-page').classList.add('close');
})

document.getElementById('to-reg').addEventListener('click', () => {
  clearInputs();
  document.getElementById('reg-page').classList.remove('close');
  document.getElementById('navigate-list').classList.add('close');
})

document.getElementById('to-main-r').addEventListener('click', () => {
  document.getElementById('reg-page').classList.add('close');
  document.getElementById('navigate-list').classList.remove('close');
})

document.getElementById('to-service').addEventListener('click', () => {
  document.getElementById('service-page').classList.remove('close');
  servicesPageCreate();
  document.getElementById('profile-page').classList.add('close');
})

document.getElementById('to-main-s').addEventListener('click', () => {
  document.getElementById('service-page').classList.add('close');
  deleteCatalog('service-list');
  document.getElementById('profile-page').classList.remove('close');
})

document.getElementById('to-sign-in').addEventListener('click', () => {
  clearInputs();
  document.getElementById('sign-in-page').classList.remove('close');
  document.getElementById('navigate-list').classList.add('close');
})

document.getElementById('to-main-e').addEventListener('click', () => {
  document.getElementById('sign-in-page').classList.add('close');
  document.getElementById('navigate-list').classList.remove('close');
})

document.getElementById('to-clubs').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.remove('close');
  clubsPageCreate();
  document.getElementById('profile-page').classList.add('close');
})

document.getElementById('to-main-c').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.add('close');
  deleteCatalog('clubs-list');
  document.getElementById('profile-page').classList.remove('close');
})


})

