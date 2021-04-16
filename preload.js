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

const bcrypt = require('bcrypt');

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
  // рабочий код, не трогать!
  let name = document.getElementById('name').value;
  let login = document.getElementById('login').value;
  let email = document.getElementById('email').value;
  let gender = document.getElementsByName('gender');
  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) {
      gender = gender[i].value;
      break;
    }
  }
  let phone = document.getElementById('phone').value;
  let birthday = document.getElementById('birthday').value;
  let about = document.getElementById('about_me').value;  
  let password = document.getElementById('password').value;
  let salt = bcrypt.genSaltSync(1);
  password = bcrypt.hashSync(password, salt);
  console.log(password);
  let password_repeat = document.getElementById('password_repeat').value;
  password_repeat = bcrypt.hashSync(password_repeat, salt);
  console.log(password_repeat);
  if (password != password_repeat) {
    console.log('пароли разные');
  } else {
    let code = document.getElementById('code').value;
    let query ='';
    let level = '';
    if (code == 'admin') {
      level = 'admin';
    } else {
      level = 'user';
    }
    query = `INSERT INTO Lovice.Users VALUES (NULL, '${login}', '${password}', '${salt}', '${name}', '${email}', '${phone}', '${birthday}', '${gender}', '${about}', '${level}');`;
    console.log('вы зарегались');
    console.log(query);
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        connection.query('SELECT * FROM Lovice.Users;', (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            console.log(rez);
          }
        })
      }  
    }) 
  }
})

// вход в систему

var this_login;
var this_password;
var this_salt;
var user_password;

// это нажатие на кнопку входа

document.getElementById('enter').addEventListener('click', () => {
  document.getElementById('error-enter').classList.add('error-clode');
  this_login = document.getElementById('ent-login').value;
  this_password = document.getElementById('ent-pass').value;
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
                document.getElementById('error-enter').classList.remove('error-close');
              } else {
                document.getElementById('profile-page').classList.remove('close');
                document.getElementById('hello-page').classList.remove('close');
                document.getElementById('sign-in-page').classList.add('close');
                function open() {
                  document.getElementById('hello-page').classList.add('close');
                  connection.query(`SELECT * FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
                    if (err) {
                      console.log(err);
                    } else {
                      document.getElementById('profile-select').innerHTML = rez[0]['Full_Name'];
                      let photo = document.createElement('div');
                      if (rez[0]['Gender'] == 'female') {
                        console.log(rez[0]['Gender']);
                        var photo_title = 'img/woman-1.svg';
                      } else {
                        console.log(rez[0]['Gender']);
                        photo_title = 'img/man-1.svg';
                      }
                      photo.innerHTML = `<div><img class="img" src="${photo_title}" alt="profile-photo" /</div>`;
                      document.getElementById('profile-photo').appendChild(photo);
                      if (rez[0]['Level'] == 'admin') {
                        document.getElementById('admin-tools').classList.remove('tools-close');
                      } else {
                        document.getElementById('user-tools').classList.remove('tools-close');
                      }
                    }
                  })
                  
                }
                setTimeout(open, 2000);
              }
            }
          })
        }
      })
    } else if (rez[0]['Kolvo'] == 0) {
      document.getElementById('error-enter').classList.remove('error-close');
    }
  })
})

console.log(this_login);

//

document.getElementById("search-but").addEventListener('click', () => {
  document.getElementById("profile-page").classList.add("close");
  document.getElementById("catalog-page").classList.remove("close");
  connection.query(`SELECT COUNT (*) AS 'Kol_vo' FROM Lovice.Users WHERE Users.Log_in <> '${this_login}' AND Users.Level <> 'admin';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      let kolvo = rez[0]['Kol_vo'];
      connection.query(`SELECT Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.About_me FROM Lovice.Users WHERE Users.Level <> 'admin' AND Users.Log_in <> '${this_login}';`, (err, rez) => {
        if (err) {
          console.log(err);
        } else {
          for (let i = 0; i < kolvo; i++) {
            let user_name = rez[i]['Full_Name'];
            let user_age = rez[i]['Age'];
            let user_about = rez[i]['About_me'];
              if (user_age >= 5 && user_age <= 20) {
                user_age = user_age + ' лет';
              } else if ((user_age%10 === 0) || ((user_age%10 >= 5) && (user_age%10 <= 9))) {
                user_age = user_age + ' лет';
              } else if (user_age%10 === 1) {
                user_age = user_age + ' год';
              } else if ((user_age%10 >= 2) && (user_age%10 <= 4)) {
                user_age = user_age + ' года';
              }
            let catalog_card = document.createElement('div');
            catalog_card.innerHTML = `<div id="user-${i}" class="catalog-card"><div class="user-info">${user_name}</div><div class="user-info">${user_age}</div><div class="user-info big">${user_about}</div><div class="user-buts"><button class="user-but like"><img class="likes" src="img/facebook-like.png"></button><button class="user-but dis"><img class="likes" src="img/thumbs-down--v2.png"></button></div></div>`;
            document.getElementById("catalog-page").appendChild(catalog_card);
          }
        }
      })  
    }
  })
})

// формирование страницы услуг

connection.query(`SELECT COUNT(*) AS 'Kolvo' FROM Lovice.Services;`, (err, rez) => {
  if (err) {
    console.log('damn');
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
            card.innerHTML = `<div id="service-${i}" class="card"><span class="title">${str}</span><div class="buy"><b>${cost} руб.</b><button class="card-but but">Выбрать</button></div></div>`;
            document.getElementById('service-list').appendChild(card);
            /*document.getElementById('card').addEventListener('mouseover', () => {
              let description = document.createElement('div');
              description.innerHTML = `<div class="about-any"><span class="title">${str}</span><div>${desc}</div></div>`;
              document.getElementById(`service-${i}`).appendChild(description);
            })*/
          }         
        }
      });
  }
});

// формирование страницы клубов

connection.query(`SELECT COUNT(*) AS 'Kolvo' FROM Lovice.Clubs`, (err, rez) => {
  if (err) {
    console.log('damn');
  } else {
    kolvo = rez[0]['Kolvo'];
    connection.query(`SELECT Clubs.Club_name, Clubs.Adress FROM Lovice.Clubs;`, (err, rez) => {
      if (err) {
        console.log('damn');
      } else {
        for (let i = 0; i < kolvo; i++) {
          str = rez[i]['Club_name'];
          let adres = rez[i]['Adress'];
          let card = document.createElement('div');
          card.innerHTML = `<div id="club-${i}" class="club card"><span class="title">"${str}"</span><span class="adres">${adres}</span><button class="card-but but">Туда!</button></div>`;
          document.getElementById('clubs-list').appendChild(card);
        }
      }
    })
  }
})

document.getElementById('change-services').addEventListener('click', () => {
  document.getElementById('profile-page').classList.add('close');
  document.getElementById('service-page').classList.remove('close');
})

// тут раздел переключения страниц, т.к. электрон не позволяет делать многостраничные приложения, пришлось ставить класс close

// открытие страницы регистрации и закрытие

document.getElementById('to-reg').addEventListener('click', () => {
  document.getElementById('reg-page').classList.remove('close');
  document.getElementById('navigate-list').classList.add('close');
})

document.getElementById('to-main-r').addEventListener('click', () => {
  document.getElementById('reg-page').classList.add('close');
  document.getElementById('navigate-list').classList.remove('close');
})

// открытие страницы услуг и закрытие

document.getElementById('to-service').addEventListener('click', () => {
  document.getElementById('service-page').classList.remove('close');
  document.getElementById('profile-page').classList.add('close');
})

document.getElementById('to-main-s').addEventListener('click', () => {
  document.getElementById('service-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
})

// открытие страницы входа и закрытие

document.getElementById('to-sign-in').addEventListener('click', () => {
  document.getElementById('sign-in-page').classList.remove('close');
  document.getElementById('navigate-list').classList.add('close');
})

document.getElementById('to-main-e').addEventListener('click', () => {
  document.getElementById('sign-in-page').classList.add('close');
  document.getElementById('navigate-list').classList.remove('close');
})

// открытие страницы клубов и закрытие

document.getElementById('to-clubs').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.remove('close');
  document.getElementById('profile-page').classList.add('close');
})

document.getElementById('to-main-c').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
})


})

