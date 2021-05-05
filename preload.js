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
    query = `INSERT INTO Lovice.Users VALUES (NULL, '${login}', '${password}', '${salt}', '${name}', '${email}', '${phone}', '${birthday}', '${gender}', '${about}', '${level}', NULL);`;
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

var this_login = '';
var this_password = '';
var this_salt = '';
var user_password = '';
var inputs = document.querySelectorAll('input');
var textareas = document.querySelectorAll('textarea');

function clearInputs() {
  inputs.forEach(el => {
    el.value = '';
  });
  textareas.forEach(el => {
    el.value = '';
  })
}

function openUserProfile() {
  document.getElementById('hello-page').classList.add('close');
  document.getElementById('profile-info').classList.remove('close');
  connection.query(`SELECT Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.Phone_Number, Users.About_me, Users.Gender, Users.Level FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      document.getElementById('profile-select').innerHTML = `<div><span class="main-info">Мое имя:</span> ${rez[0]['Full_Name']}</div><br/>
            <div><span class="main-info">Мой возраст:</span> ${ageCalc(rez[0]['Age'])}</div><br/>
            <div><span class="main-info">Мой номер телефона:</span> ${rez[0]['Phone_Number']}</div><br/>
            <div><span class="main-info">Обо мне:</span> ${rez[0]['About_me']}</div>`;
      var photo_title;
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

function exitFromProfile() {
  document.getElementById('profile-select').innerHTML = '';
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
  document.getElementById('navigate-list').classList.remove('close');
  document.getElementById('enter').addEventListener('click', enterWithLogin);
}

document.getElementById('exit-profile-admin').addEventListener('click', exitFromProfile);

document.getElementById('exit-profile-user').addEventListener('click', exitFromProfile);

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

window.addEventListener('DOMContentLoaded', automaticEnter());

function setOnline() {
  connection.query(`UPDATE Lovice.Users SET Users.User_online = 'online' WHERE Users.Log_in = '${this_login}';`);
}

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
                clearInputs();
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
      clearInputs();
      showMessage('error-enter', 'Неверное имя пользователя или пароль!');
    }
  })
}

console.log(this_login);

var user_age;
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

//

  function renderCatalog() {
    connection.query(`SELECT COUNT (*) AS 'Kol_vo' FROM Lovice.Users WHERE Users.Level <> 'admin' AND Users.Log_in <> '${this_login}';`, (err, rez) => {
      if (err) {
        console.log(err);
      } else {
        let kolvo = rez[0]['Kol_vo'];
        connection.query(`SELECT Users.Full_Name, (YEAR(CURRENT_DATE)-YEAR(Users.Birthday)) AS 'Age', Users.About_me FROM Lovice.Users WHERE Users.Level <> 'admin' AND Users.Log_in <> '${this_login}';`, (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            for (let i = 0; i < kolvo; i++) {
              user_name = rez[i]['Full_Name'];
              user_age = rez[i]['Age'];
              user_about = rez[i]['About_me'];
              let catalog_card = document.createElement('div');
              catalog_card.innerHTML = `<div id="user-${i}" class="catalog-card"><div class="user-info">${user_name}</div><div class="user-info">${ageCalc(user_age)}</div><div class="user-info big">${user_about}</div><div class="user-buts"><button class="user-but like"><img class="likes" src="img/facebook-like.png"></button><button class="user-but dis"><img class="likes" src="img/thumbs-down--v2.png"></button></div></div>`;
              document.getElementById("catalog-page-cards").appendChild(catalog_card);
            }
          }
        })  
      }
    })
  }

  function deleteCatalog() {
    let arr = document.getElementById('catalog-page-cards');
    while (arr.firstChild) {
      arr.removeChild(arr.lastChild);
    }
  }

  document.getElementById('search-but').addEventListener('click', () => {
    document.getElementById('catalog-page').classList.remove('close');
    document.getElementById('profile-page').classList.add('close');
    renderCatalog();
  })


function openCatalogForAdmins() {
  connection.query(`SELECT COUNT (*) AS 'Kolvo' FROM Lovice.Users WHERE Users.Log_in <> '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      let kolvo = rez[0]['Kolvo'];
    console.log(rez);
    connection.query(`SELECT * FROM Lovice.Users WHERE Users.Log_in <> '${this_login}';`, (err, rez) => {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < kolvo; i++) {
          let allCatalogCard = document.createElement('div');
          allCatalogCard.innerHTML = `
          <div class="catalog-card">
          <span class="labels">${rez[i]['Log_in']}</span>
          <span class="labels">${rez[i]['Full_Name']}</span>
          <span class="labels">${rez[i]['Email']}</span>
          <span class="labels">${rez[i]['Phone_Number']}</span>
          <span class="labels">${rez[i]['Birthday']}</span>
          <span class="labels">${rez[i]['Gender']}</span>
          <span class="labels">${rez[i]['About_me']}</span>
          </div>`;
          if (rez[i]['Level'] == 'admin') {
            document.getElementById('admin-pages').appendChild(allCatalogCard);
          } else {
            document.getElementById('user-pages').appendChild(allCatalogCard);
          }
        }
      }
    })
    }
  })
}

document.getElementById('users-notice').addEventListener('click', () => {
  document.getElementById('all-users').classList.remove('close');
  document.getElementById('profile-page').classList.add('close');
  openCatalogForAdmins();
});

  
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
            card.innerHTML = `<div id="service-${i}" class="card"><span class="title">${str}</span><div id="service-desc-${i}" class="descript hidden">${desc}</div><div class="buy"><b>${cost} руб.</b><button class="card-but but">Выбрать</button></div></div>`;
            document.getElementById('service-list').appendChild(card);
          }  
          for (let i = 0; i < kolvo; i++) {
            document.getElementById(`service-${i}`).addEventListener('mouseover', () => {
              document.getElementById(`service-desc-${i}`).classList.remove('hidden');
              document.getElementById(`service-desc-${i}`).classList.add('visible');
              //document.getElementById(`service-desc-${i}`).classList.remove('close');
            })
            document.getElementById(`service-${i}`).addEventListener('mouseout', () => {
              document.getElementById(`service-desc-${i}`).classList.remove('visible');
              document.getElementById(`service-desc-${i}`).classList.add('hidden');
              //document.getElementById(`service-desc-${i}`).classList.add('close');
            })
          }       
        }
      });
  }
});

//

document.getElementById('search-but-main').addEventListener('click', () => {
  if (this_login === '') {
    console.log('Авторизуйтесь в системе');
  } else {
    let search = document.getElementById('search-input').value;
    connection.query(`SELECT * FROM Lovice.Users WHERE Users.Full_Name LIKE "%${search}%" OR Users.Log_in LIKE "%${search}%";`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      if (rez == '') {
        connection.query(`SELECT * FROM Lovice.Services WHERE Services.ServiceName LIKE "%${search}%";`, (err, rez) => {
          if (err) {
            console.log(err);
          } else {
            if (rez == '') {
              connection.query(`SELECT * FROM Lovice.Clubs WHERE Clubs.Club_name LIKE "%${search}%";`, (err, rez) => {
                if (err) {
                  console.log(err);
                } else {
                  if (rez == '') {
                    console.log('по вашему запросу ничего не найдено');
                  } else {
                    console.log(rez);
                  }
                }
              })
            } else {
              console.log(rez);
            }
          }
        })
      } else {
        console.log(rez);
      }
    }
  })
  }
})

document.getElementById('delete-profile-user').addEventListener('click', () => {
  console.log('вы хотите удалить профиль?');
  connection.query(`INSERT INTO Lovice.Archive SELECT * FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
    if (err) {
      console.log(err);
    } else {
      connection.query(`DELETE FROM Lovice.Users WHERE Users.Log_in = '${this_login}';`, (err, rez) => {
        if (err) {
          console.log(err);
        } else {
          console.log('ваш аккаунт успешно удален');
        }
      })
    }
  })
})

// формирование страницы клубов

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
          card.innerHTML = `<div id="club-${i}" class="club card"><span class="title">"${str}"</span><span class="adres">${adres}</span><div id="club-desc-${i}" class="descript hidden">${desc}</div><button class="card-but but">Туда!</button></div>`;
          document.getElementById('clubs-list').appendChild(card);

        }
        for (let i = 0; i < kolvo; i++) {
          document.getElementById(`club-${i}`).addEventListener('mouseover', () => {
            document.getElementById(`club-desc-${i}`).classList.remove('hidden');
            document.getElementById(`club-desc-${i}`).classList.add('visible');
            //document.getElementById(`service-desc-${i}`).classList.remove('close');
          })
          document.getElementById(`club-${i}`).addEventListener('mouseout', () => {
            document.getElementById(`club-desc-${i}`).classList.remove('visible');
            document.getElementById(`club-desc-${i}`).classList.add('hidden');
            //document.getElementById(`service-desc-${i}`).classList.add('close');
          })
        }
      }
    })
  }
})

function editServices() {
  let serviceName = document.getElementById('service-name-input').value;
  let serviceCost = document.getElementById('service-cost-input').value;
  let serviceDesc = document.getElementById('service-desc-input').value;
  connection.query(`INSERT INTO Lovice.Services VALUES (NULL, '${serviceName}', '${serviceCost}', '${serviceDesc}');`, (err) => {
    if (err) {
      console.log(err);
    } else {
      clearInputs();
      showMessage('success-add-serv', 'Услуга успешно добавлена!');
    }
  });
}

function editClubs() {
  let clubName = document.getElementById('club-name-input').value;
  let clubCost = document.getElementById('club-address-input').value;
  let clubDesc = document.getElementById('club-desc-input').value;
  connection.query(`INSERT INTO Lovice.Clubs VALUES (NULL, '${clubName}', '${clubCost}', '${clubDesc}');`, (err) => {
    if (err) {
      console.log(err);
    } else {
      clearInputs();
      showMessage('success-add-club', 'Заведение успешно добавлено!');
    }
  });
}

function showMessage(id, text) {
  let block = document.getElementById(id);
  block.classList.remove('close');
  block.innerHTML = text;
  setTimeout(() => {
    block.classList.add('close');
  }, 3000);
}

document.getElementById('to-pofile-from-catalog').addEventListener('click', () => {
  document.getElementById('catalog-page').classList.add('close');
  document.getElementById('profile-page').classList.remove('close');
  deleteCatalog();
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
  document.getElementById('change-services-page').classList.add('close');
})

document.getElementById('view-clubs').addEventListener('click', () => {
  document.getElementById('clubs-page').classList.remove('close');
  document.getElementById('change-clubs-page').classList.add('close');
})

// тут раздел переключения страниц, т.к. электрон не позволяет делать многостраничные приложения, пришлось ставить класс close

// открытие страницы регистрации и закрытие

document.getElementById('to-reg').addEventListener('click', () => {
  clearInputs();
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
  clearInputs();
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

