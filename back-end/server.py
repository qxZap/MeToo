from flask import Flask
from flask import request,jsonify,Response,json,redirect
from flask_cors import CORS,cross_origin
import mysql.connector
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
import urllib2
import smtplib
from email.mime.text import MIMEText
import uuid
import math
import os
app = Flask(__name__)
api = Api(app)
CORS(app, supports_credentials=True)
UPLOAD_FOLDER = os.path.basename('resources')
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])



accessDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)

checkAccessDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)

activationDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)

roomsDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)

usersDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)

locationsDB = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp",
  autocommit=True
)


def reconnectDB(access=False,users=False,rooms=False,activation=False,checkAccess=False,locations=False):
    global accessDB,usersDB,roomsDB,activationDB,checkAccessDB
    if access:
        accessDB = mysql.connector.connect(
          host="localhost",
          user="cliwapp",
          passwd="elburaga",
          database="cliwapp",
          autocommit=True
        )
    if users:
        usersDB = mysql.connector.connect(
          host="localhost",
          user="cliwapp",
          passwd="elburaga",
          database="cliwapp",
          autocommit=True
        )
    if rooms:
        roomsDB = mysql.connector.connect(
          host="localhost",
          user="cliwapp",
          passwd="elburaga",
          database="cliwapp",
          autocommit=True
        )
    if activation:
        activationDB = mysql.connector.connect(
          host="localhost",
          user="cliwapp",
          passwd="elburaga",
          database="cliwapp",
          autocommit=True
        )
    if checkAccess:
        checkAccessDB = mysql.connector.connect(
          host="localhost",
          user="cliwapp",
          passwd="elburaga",
          database="cliwapp",
          autocommit=True
        )
    if locations:
        locationsDB = mysql.connector.connect(
        host="localhost",
        user="cliwapp",
        passwd="elburaga",
        database="cliwapp",
        autocommit=True
        )


mail = smtplib.SMTP('smtp.gmail.com',587)
mail.ehlo()
mail.starttls()
mail.login("cliwapp@gmail.com","elburaga")


def hasAccess(accessToken):
    global checkAccessDB
    reconnectDB(checkAccess=True)
    if accessToken==None:
        return False
    sql = "SELECT username FROM access WHERE accessToken='"+accessToken+"'"
    mycursor = checkAccessDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    if fetched==None:
        return False
    if len(fetched)==0:
        return False
    else:
        return fetched[0][0]


def activate(username):
    sql = "DELETE FROM activation WHERE username='"+username+"'"
    mycursor = activationDB.cursor(buffered=True)
    mycursor.execute(sql)
    sql = "UPDATE users SET activated=1 WHERE username='"+username+"'"
    mycursor = usersDB.cursor(buffered=True)

    mycursor.execute(sql)
    activationDB.commit()
    usersDB.commit()


def sendMail(to,activationToken):
    string = "This is your activation link: http://cliwapp.com/activate/"+activationToken
    msg = MIMEText(string)
    msg['Subject'] = "MeToo - activate your account"
    msg['From'] = "cliwapp@gmail.com"
    msg['To'] = to
    mail.sendmail("cliwapp@gmail.com",to,msg.as_string())
    #mail.quit()

def distanceBetween2Points(lat1, lon1, lat2, lon2):
    earthRadiusKm = 6371
    dLat = math.radians(lat2-lat1)
    dLon = math.radians(lon2-lon1)

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    a = math.sin(dLat/2) * math.sin(dLat/2) + math.sin(dLon/2) * math.sin(dLon/2) * math.cos(lat1) * math.cos(lat2)
    c = 2 * math.atan2(math.sqrt(a),math.sqrt(1-a))
    return earthRadiusKm * c


def newRoom(owner,roomName,lobbySize,description,location,lobby,tags,title,link):
    roomID = str(uuid.uuid4())
    sql = 'INSERT INTO rooms (roomID,owner,roomName,lobbySize,description,location,lobby,tags,title,link) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'
    val = (roomID,owner,roomName,lobbySize,description,location,lobby,tags,title,link)
    mycursor = roomsDB.cursor(buffered=True)
    mycursor.execute(sql,val)
    roomsDB.commit()


def addToActivation(username):
    activationToken = str(uuid.uuid4())
    sql = 'INSERT INTO activation (username,activationToken) VALUES (%s,%s)'
    val = (username,activationToken)
    mycursor = activationDB.cursor(buffered=True)
    mycursor.execute(sql,val)
    activationDB.commit()
    return activationToken

def register(username,password,email,date,country):
    sql = 'INSERT INTO users (username,password,email,date,country,activated,profilePicture) VALUES (%s,%s,%s,%s,%s,%s,%s)'
    val = (username,password,email,date,country,0,'def.png')
    mycursor = usersDB.cursor(buffered=True)
    mycursor.execute(sql,val)
    usersDB.commit()
    sendMail(email,addToActivation(username))
    return True

def newAccessToken(username):
    global accessDB
    reconnectDB(access=True)
    accessToken = str(uuid.uuid4())+str(uuid.uuid4())
    sql = 'INSERT INTO access (username,accessToken) VALUES (%s,%s)'
    val = (username,accessToken)
    mycursor = accessDB.cursor(buffered=True)
    mycursor.execute(sql,val)
    accessDB.commit()
    return accessToken
    

def login(username,password):
    sql = "SELECT password,activated,profilePicture from users where username='"+username+"'"
    mycursor = usersDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    newToken = newAccessToken(username)
    if len(fetched)<1:
        return 2,0,0
    if fetched[0][1]==0:
        return 3,0,0
    if len(fetched)==0:
        return 1,0,0
    if fetched[0][0] == password:
        return True,newToken,fetched[0][2]

    return 2,0,0

@app.route('/wtf', methods = ['GET'])
@cross_origin(origin="*")
def wtf():
    return '''
    <!DOCTYPE html>

<html>

<head>
<title>Hello!</title>
<script>
function notify(){

if (Notification.permission !== "granted") {
Notification.requestPermission();
}
 else{
var notification = new Notification('hello', {
  body: "Hey there!",
});
notification.onclick = function () {
  window.open("http://google.com");
};
}
}
</script>
</head>

<body>
<button onclick="notify()">Notify</button>
</body>
</html>
''',200

@app.route('/iamhere',methods = ['POST'])
@cross_origin(origin="*")
def setLocation():
    content = request.get_json()
    hasAcc = hasAccess(content['accessToken'])
    if hasAcc:
        sql = "DELETE FROM locations WHERE username='"+hasAcc+"'"
        mycursor = locationsDB.cursor(buffered=True)
        mycursor.execute(sql)
        usersDB.commit()

        sql = 'INSERT INTO locations (username,lat,lon) VALUES (%s,%s,%s)'
        #sql = 'UPDATE locations SET lat=(%s) , lon=(%s) where username=(%s)'
        val = (hasAcc,content['lat'],content['lon'])
        mycursor = locationsDB.cursor(buffered=True)
        mycursor.execute(sql,val)
        usersDB.commit()
        return jsonify(status=True),200
    return jsonify(status=False),404


@app.route('/rooms/delete/<string:roomID>/<string:accessToken>',methods=['DELETE'])
@cross_origin(origin="*") 
def deleteRoom(roomID,accessToken):
    hasAcc = hasAccess(accessToken)
    if hasAcc:
        sql="DELETE FROM rooms WHERE roomID='"+roomID+"' and owner='"+hasAcc+"'" 
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)   
        return jsonify(wtf="wtf"),200
    else:
        return jsonify(rooms=[]),404



@app.route('/login', methods = ['POST'])
@cross_origin(origin="*")
def loginAPIPath():
    content = request.get_json()
    status,accessToken,profilePicture = login(content['username'],content['password'])
    if profilePicture==0:
        profilePicture="def.png"
    if status==1:
        return jsonify(
                status=status,
                accessToken=accessToken,
                profilePicture=profilePicture
          ),211
    elif status==2:
        return jsonify(
                status=status,
                accessToken="No username named "+content['username']+" was found"
          ),212
    else:
        return jsonify(
                status=status,
                accessToken="Account "+content['username']+" needs to be activated. Check Inbox."
          ),214

@app.route('/register', methods = ['POST'])
@cross_origin(origin="*")
def registerAPIPath():
    content = request.get_json()
    status = register(content['username'],content['password'],content['email'],content['date'],content['country'])
    return jsonify(
        status=status,
        text='Worked'
    ),200

@app.route('/userexists/<string:username>', methods=['GET'])
@cross_origin(origin="*")
def usernameExits(username):
    sql = "SELECT username FROM users where username='"+username+"'"
    mycursor = usersDB.cursor(buffered=True)
    mycursor.execute(sql)
    if len(mycursor.fetchall())>0:
      return username,211
    return username,212

@app.route('/mailexits/<string:email>', methods=['GET'])
@cross_origin(origin="*")
def mailExits(email):
    sql = "SELECT email FROM users where email='"+email+"'"
    mycursor = usersDB.cursor(buffered=True)
    mycursor.execute(sql)
    if len(mycursor.fetchall())>0:
      return email,211
    return email,212

@app.route('/activate/<string:activationToken>',methods=['GET'])
@cross_origin(origin="*") 
def activateAccount(activationToken):
    sql = "SELECT username FROM activation WHERE activationToken='"+activationToken+"'"
    mycursor = activationDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    if len(fetched)==0:
        return "",404
    else:
        activate(fetched[0][0])
    return redirect("http://localhost/MeToo-master/Front-end/Activation.html", code=302)

@app.route('/whoami',methods=['POST'])
@cross_origin(origin="*") 
def whoami():
    content = request.get_json()
    return jsonify(username=hasAccess(content['accessToken'])),200


@app.route('/len/<float:lat>/<float:lon>/<float:lat2>/<float:lon2>',methods=['GET'])
@cross_origin(origin="*") 
def calculateLen(lat,lon,lat2,lon2):
    return str(distanceBetween2Points(lat,lon,lat2,lon2)),200

@app.route('/deleteme/<string:accessToken>',methods=['DELETE'])
@cross_origin(origin="*") 
def deleteMe(accessToken):
    global accessDB
    reconnectDB(access=True)
    sql = "DELETE FROM access WHERE accessToken='"+accessToken+"'"    
    mycursor = accessDB.cursor(buffered=True)
    mycursor.execute(sql)
    return jsonify(status=True),200

@app.route('/rooms/myrooms/<string:accessToken>',methods=['GET'])
@cross_origin(origin="*") 
def getMyRooms(accessToken):
    global accessDB
    reconnectDB(access=True)
    hasAcc = hasAccess(accessToken)
    if accessToken==False or accessToken==None or hasAcc==False:
        return jsonify(rooms=[]),404
    sql = "SELECT * FROM rooms WHERE owner='"+hasAcc+"'"
    mycursor = roomsDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    toReturn = []
    for i in fetched:
        newGeoLocation = (i[5].decode("UTF-8")).split(' ')
        lat2 = float(newGeoLocation[0])
        lon2 = float(newGeoLocation[1])
        room = {
                  "roomID":i[0].decode("UTF-8"),
                  "owner":i[1].decode("UTF-8"),
                  "roomName":i[2].decode("UTF-8"),
                  "lobbySize":i[3],
                  "description":i[4].decode("UTF-8"),
                  "location":i[5].decode("UTF-8"),
                  "lobby":(i[6].decode("UTF-8")).split(','),
                  "tags":(i[7].decode("UTF-8")).split(','),
                  "title":i[8].decode("UTF-8"),
                  "link":i[9].decode("UTF-8")
        }    
        toReturn.append(room)
    return jsonify(rooms=toReturn),200

@app.route('/rooms/<float:range>/<float:lat>/<float:lon>',methods=['GET'])
@cross_origin(origin="*") 
def getRoomsInRange(range,lat,lon):
    global accessDB
    reconnectDB(access=True)
    sql = "SELECT * FROM rooms"
    mycursor = roomsDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    toReturn = []
    for i in fetched:
        newGeoLocation = (i[5].decode("UTF-8")).split(' ')
        lat2 = float(newGeoLocation[0].decode("UTF-8"))
        lon2 = float(newGeoLocation[1].decode("UTF-8"))
        if distanceBetween2Points(lat,lon,lat2,lon2)<range and i[3]>len((i[6].decode("UTF-8")).split(',')):
            room = {
                  "roomID":i[0].decode("UTF-8"),
                  "owner":i[1].decode("UTF-8"),
                  "roomName":i[2].decode("UTF-8"),
                  "lobbySize":i[3],
                  "description":i[4].decode("UTF-8"),
                  "location":i[5].decode("UTF-8"),
                  "lobby":(i[6].decode("UTF-8")).split(','),
                  "tags":(i[7].decode("UTF-8")).split(','),
                  "title":i[8].decode("UTF-8"),
                  "link":i[9].decode("UTF-8")
            }    
            toReturn.append(room)
    return jsonify(rooms=toReturn),200

@app.route('/rooms/get/<string:roomID>/<string:accessToken>',methods=['GET'])
@cross_origin(origin="*") 
def getRoom(roomID,accessToken):
    global roomsDB,accessDB
    reconnectDB(rooms=True,access=True)
    hasAcc = hasAccess(accessToken)
    if hasAcc:
        sql = "SELECT * FROM rooms where roomID='"+roomID+"'"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()
        i=fetched[0]
        room = {
                  "roomID":i[0].decode("UTF-8"),
                  "owner":i[1].decode("UTF-8"),
                  "roomName":i[2].decode("UTF-8"),
                  "lobbySize":i[3],
                  "description":i[4].decode("UTF-8"),
                  "location":i[5].decode("UTF-8"),
                  "lobby":(i[6].decode("UTF-8")).split(','),
                  "tags":(i[7].decode("UTF-8")).split(','),
                  "title":i[8].decode("UTF-8"),
                  "link":i[9].decode("UTF-8")
            }
        return jsonify(room=room),200

    else:
        return jsonify(rooms=[]),401


@app.route('/rooms/search/<float:range>/<float:lat>/<float:lon>',methods=['POST'])
@cross_origin(origin="*")
def seachRooms(range,lat,lon):
    global roomsDB
    reconnectDB(rooms=True)
    content = request.get_json()
    missing = []

    if 'accessToken' not in content:
        missing.append('accessToken')
    if type(range)!=float:
        missing.append('range')
    if 'tags' not in content:
        missing.append('tags')
    if len(missing)>0:
        return jsonify(status=False,missing=missing),204

    if hasAccess(content['accessToken']):
        sql = "SELECT * FROM rooms"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()
        toReturn = []
        for i in fetched:
            newGeoLocation = (i[5].decode("UTF-8")).split(' ')
            lat2 = float(newGeoLocation[0].decode("UTF-8"))
            lon2 = float(newGeoLocation[1].decode("UTF-8"))
            if distanceBetween2Points(lat,lon,lat2,lon2)<range and (i[7].decode("UTF-8")).split(',')!=[u'']:
                counter = 0
                for j in content['tags']:
                    if j in (i[7].decode("UTF-8")).split(','):
                        counter+=1
                if counter>0:
                    room = {
                      "roomID":i[0].decode("UTF-8"),
                      "owner":i[1].decode("UTF-8"),
                      "roomName":i[2].decode("UTF-8"),
                      "lobbySize":i[3], 
                      "description":i[4].decode("UTF-8"),
                      "location":i[5].decode("UTF-8"),
                      "lobby":(i[6].decode("UTF-8")).split(','),
                      "tags":(i[7].decode("UTF-8")).split(','),
                      "title":i[8].decode("UTF-8"),
                      "link":i[9].decode("UTF-8"),
                      "counter":counter
                    }    
                    toReturn.append(room)
        toReturn = sorted(toReturn,key=lambda x:x['counter'], reverse=True)
        print(toReturn)
        return jsonify(rooms=toReturn),200

    else:
        return jsonify(status=False,notFound=content['accessToken']),404


@app.route('/upload/<string:username>/<string:accessToken>', methods=['POST'])
def upload_file(username,accessToken):
    global accessDB
    reconnectDB(access=True)
    hasAcc = hasAccess(accessToken)
    if hasAcc==username:
        file = request.files['image']
        newFileName=username+'.'+file.filename.split('.')[1]
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], newFileName))
        sql = "UPDATE users SET profilePicture='"+newFileName+"' where username='"+username+"'"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)

        return jsonify(status=True,path=newFileName,link=newFileName,code=200),200
    else:
        return jsonify(status=False,code=401
          ),401

def changePassword(who,password,newPassword):
    global usersDB
    reconnectDB(users=True)
    sql = "UPDATE users SET password='"+newPassword+"' WHERE username='"+who+"' and password='"+password+"'";
    mycursor = roomsDB.cursor(buffered=True)
    mycursor.execute(sql)
    return 0


@app.route('/profile/change/password',methods=['POST'])
@cross_origin(origin="*")
def changePasswordAPI():
    content = request.get_json()
    missing = []
    if 'username' not in content:
        missing.append('username')
    if 'accessToken' not in content:
        missing.append('accessToken')
    if 'password' not in content:
        missing.append('password')
    if 'newPassword' not in content:
        missing.append('newPassword')
    if len(missing)>0:
        return jsonify(missing=missing),206
    hasAcc = hasAccess(content['accessToken'])
    if hasAcc==content['username']:
        result = changePassword(content['username'],content['password'],content['newPassword'])
        return jsonify(status=result),200


@app.route('/profile/picture/<string:username>',methods=['GET'])
@cross_origin(origin="*")
def getProfilePicture(username,):
    global accessDB,usersDB
    reconnectDB(access=True,users=True)
    
    sql = "SELECT profilePicture FROM users WHERE username='"+username+"'"
    mycursor = roomsDB.cursor(buffered=True)
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    print(fetched[0][0])
    if len(fetched)==0:
        return jsonify(status=True,url='assets/UserPhoto.png'),200
    else:
        return jsonify(status=True,url='http://127.0.0.1:8000/'+fetched[0][0]),200



@app.route('/profile/pictures/<string:accessToken>',methods=['POST'])
@cross_origin(origin="*")
def getProfilePictures(accessToken):
    global accessDB,usersDB
    reconnectDB(access=True,users=True)
    content = request.get_json()
    hasAcc = hasAccess(accessToken)
    if hasAcc:
        sql = "SELECT profilePicture FROM users WHERE username='"+username+"'"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()
        print(fetched[0][0])
        if len(fetched)==0:
            return jsonify(status=True,url='assets/UserPhoto.png'),200
        else:
            return jsonify(status=True,url='http://127.0.0.1:8000/'+fetched[0][0]),200

    else:  
        return jsonify(status=False,url='Unknown user'),404
    return jsonify(status=False,url='Error'),404


@app.route('/rooms/join',methods=['POST'])
@cross_origin(origin="*")
def joinRoom():
    global roomsDB
    reconnectDB(rooms=True)
    content = request.get_json()
    accessToken = content['accessToken']
    hasAcc = hasAccess(accessToken)
    if hasAcc:
        roomID = content['roomID']
        sql = "SELECT * FROM rooms WHERE roomID='"+roomID+"'"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()[0]
        lobbySize = fetched[3]
        lobby = (fetched[6].decode("UTF-8")).split(',')
        if hasAcc in lobby:
            return jsonify(status=False,text="Aldready in the room"),409
        if len(lobby)<lobbySize:   
            lobby.append(hasAcc)
            newLobby =  ",".join(map(str,lobby))
            sql = "UPDATE rooms SET lobby=(%s) WHERE roomID=(%s)"
            val = (newLobby,roomID)
            mycursor = roomsDB.cursor(buffered=True)
            mycursor.execute(sql,val)
            return jsonify(status=True,text="Joined sucessfuly"),200
        else:
            return jsonify(status=True,text="Room full aldready"),409
    return "wtf?",200

@app.route('/rooms/leave',methods=['POST'])
@cross_origin(origin="*")
def leaveRoom():
    global roomsDB
    reconnectDB(rooms=True)
    content = request.get_json()
    accessToken = content['accessToken']
    hasAcc = hasAccess(accessToken)
    if hasAcc:
        roomID = content['roomID']
        sql = "SELECT * FROM rooms WHERE roomID='"+roomID+"' and owner!='"+hasAcc+"'"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()[0]
        lobbySize = fetched[3]
        lobby = (fetched[6].decode("UTF-8")).split(',')
        if hasAcc not in lobby:
            return jsonify(status=False,text="Not in the room"),401
        lobby.remove(hasAcc)
        newLobby =  ",".join(map(str,lobby))
        sql = "UPDATE rooms SET lobby=(%s) WHERE roomID=(%s)"
        val = (newLobby,roomID)
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql,val)
        return jsonify(status=True,text="Left sucessfuly"),200
    else:
        return jsonify(status=False,text="Not Found"),404
    return "wtf?",200



'''
 sql = "SELECT * FROM rooms"
        mycursor = roomsDB.cursor(buffered=True)
        mycursor.execute(sql)
        fetched = mycursor.fetchall()
        toReturn = []
        for i in fetched:
            newGeoLocation = (i[5].decode("UTF-8")).split(' ')
            lat2 = float(newGeoLocation[0].decode("UTF-8"))
            lon2 = float(newGeoLocation[1].decode("UTF-8"))
            if distanceBetween2Points(lat,lon,lat2,lon2)<range and (i[7].decode("UTF-8")).split(',')!=[u'']:
                counter = 0
                for j in content['tags']:
                    if j in (i[7].decode("UTF-8")).split(','):
                        counter+=1
                if counter>0:
                    room = {
                      "roomID":i[0].decode("UTF-8"),
                      "owner":i[1].decode("UTF-8"),
                      "roomName":i[2].decode("UTF-8"),
                      "lobbySize":i[3], 
                      "description":i[4].decode("UTF-8"),
                      "location":i[5].decode("UTF-8"),
                      "lobby":(i[6].decode("UTF-8")).split(','),
                      "tags":(i[7].decode("UTF-8")).split(','),
                      "title":i[8].decode("UTF-8"),
                      "link":i[9].decode("UTF-8"),
                      "counter":counter
                    }    
                    toReturn.append(room)
        toReturn = sorted(toReturn,key=lambda x:x['counter'], reverse=True)
        print(toReturn)
        return jsonify(rooms=toReturn),200

'''

@app.route('/new_room',methods=['POST'])
@cross_origin(origin="*")
def newRoomAPIPath():
    global roomsDB
    reconnectDB(rooms=True)
    content = request.get_json()
    if 'owner' not in content:
        content['owner']=hasAccess(content['accessToken'])
    if 'tags' not in content:
        content['tags']=""
    if 'lobby' not in content:
        content['lobby']=hasAccess(content['accessToken'])
    if 'link' not in content:
        content['link']=""

    if content['owner']==hasAccess(content['accessToken']):        
        newRoom(content['owner'],content['roomName'],content['lobbySize'],content['description'],content['location'],content['lobby'],content['tags'],content['title'],content['link'])
        return jsonify(
            status=True,
            text='Worked',
            username=content['owner']
        ),200
    else:
        return "wtf?",401

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.run(host='0.0.0.0', port=8090,debug=True)
