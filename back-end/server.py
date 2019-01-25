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
app = Flask(__name__)
api = Api(app)
CORS(app, supports_credentials=True)


mydb = mysql.connector.connect(
  host="localhost",
  user="cliwapp",
  passwd="elburaga",
  database="cliwapp"
)
mycursor = mydb.cursor()

mail = smtplib.SMTP('smtp.gmail.com',587)
mail.ehlo()
mail.starttls()
mail.login("cliwapp@gmail.com","elburaga")


def hasAccess(accessToken):
    sql = "SELECT username FROM access WHERE accessToken='"+accessToken+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    if len(fetched)==0:
        return False
    else:
        return fetched[0][0]


def activate(username):
    sql = "DELETE FROM activation WHERE username='"+username+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    sql = "UPDATE users SET activated=1 WHERE username='"+username+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    mydb.commit()


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


def newRoom(owner,roomName,lobbySize,description,location,lobby,tags):
    sql = 'INSERT INTO rooms (owner,roomName,lobbySize,description,location,lobby,tags) VALUES (%s,%s,%s,%s,%s,%s,%s)'
    val = (owner,roomName,lobbySize,description,location,lobby,tags)
    mycursor = mydb.cursor()
    mycursor.execute(sql,val)
    mydb.commit()


def addToActivation(username):
    activationToken = str(uuid.uuid4())
    sql = 'INSERT INTO activation (username,activationToken) VALUES (%s,%s)'
    val = (username,activationToken)
    mycursor = mydb.cursor()
    mycursor.execute(sql,val)
    mydb.commit()
    return activationToken

def register(username,password,email,date,country):
    sql = 'INSERT INTO users (username,password,email,date,country,activated) VALUES (%s,%s,%s,%s,%s,%s)'
    val = (username,password,email,date,country,0)
    mycursor = mydb.cursor()
    mycursor.execute(sql,val)
    mydb.commit()
    sendMail(email,addToActivation(username))
    return True

def newAccessToken(username):
    accessToken = str(uuid.uuid4())+str(uuid.uuid4())
    sql = 'INSERT INTO access (username,accessToken) VALUES (%s,%s)'
    val = (username,accessToken)
    mycursor = mydb.cursor()
    mycursor.execute(sql,val)
    mydb.commit()
    return accessToken
    

def login(username,password):
    sql = "SELECT password from users where username='"+username+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    if len(fetched)==0:
        return False,0
    if fetched[0][0] == password:
        return True,newAccessToken(username)

    return False,0


@app.route('/login', methods = ['POST'])
@cross_origin(origin="*")
def loginAPIPath():
    content = request.get_json()
    status,accessToken = login(content['username'],content['password'])
    if status:
        return jsonify(
                status=status,
                accessToken=accessToken
          ),211
    else:
        return jsonify(
                status=status,
                accessToken="No username named "+content['username']+" was found"
          ),212

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
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    if len(mycursor.fetchall())>0:
      return username,211
    return username,212

@app.route('/mailexits/<string:email>', methods=['GET'])
@cross_origin(origin="*")
def mailExits(email):
    sql = "SELECT email FROM users where email='"+email+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    if len(mycursor.fetchall())>0:
      return email,211
    return email,212

@app.route('/activate/<string:activationToken>',methods=['GET'])
@cross_origin(origin="*") 
def activateAccount(activationToken):
    sql = "SELECT username FROM activation WHERE activationToken='"+activationToken+"'"
    mycursor = mydb.cursor()
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

@app.route('/rooms/myrooms/<string:accessToken>',methods=['GET'])
@cross_origin(origin="*") 
def getMyRooms(accessToken):
    sql = "SELECT * FROM rooms WHERE owner='"+hasAccess(accessToken)+"'"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    toReturn = []
    for i in fetched:
        newGeoLocation = (i[4].decode("UTF-8")).split(' ')
        lat2 = float(newGeoLocation[0])
        lon2 = float(newGeoLocation[1])
        room = {
                  "owner":i[0].decode("UTF-8"),
                  "roomName":i[1].decode("UTF-8"),
                  "lobbySize":i[2],
                  "description":i[3].decode("UTF-8"),
                  "location":i[4].decode("UTF-8"),
                  "lobby":(i[5].decode("UTF-8")).split(','),
                  "tags":(i[5].decode("UTF-8")).split(',')
        }    
        toReturn.append(room)
    return jsonify(rooms=toReturn),200

@app.route('/rooms/<float:range>/<float:lat>/<float:lon>',methods=['GET'])
@cross_origin(origin="*") 
def getRoomsInRange(range,lat,lon):
    sql = "SELECT * FROM rooms"
    mycursor = mydb.cursor()
    mycursor.execute(sql)
    fetched = mycursor.fetchall()
    toReturn = []
    for i in fetched:
        newGeoLocation = (i[4].decode("UTF-8")).split(' ')
        lat2 = float(newGeoLocation[0])
        lon2 = float(newGeoLocation[1])
        if distanceBetween2Points(lat,lon,lat2,lon2)<range and i[2]>len((i[5].decode("UTF-8")).split(',')):
            room = {
                  "owner":i[0].decode("UTF-8"),
                  "roomName":i[1].decode("UTF-8"),
                  "lobbySize":i[2],
                  "description":i[3].decode("UTF-8"),
                  "location":i[4].decode("UTF-8"),
                  "lobby":(i[5].decode("UTF-8")).split(','),
                  "tags":(i[5].decode("UTF-8")).split(',')
            }    
            toReturn.append(room)
    return jsonify(rooms=toReturn),200



@app.route('/new_room',methods=['POST'])
@cross_origin(origin="*")
def newRoomAPIPath():
    content = request.get_json()
    if 'owner' not in content:
        content['owner']=hasAccess(content['accessToken'])
    if 'tags' not in content:
        content['tags']=""
    if 'lobby' not in content:
        content['lobby']=hasAccess(content['accessToken'])
    if content['owner']==hasAccess(content['accessToken']):        
        newRoom(content['owner'],content['roomName'],content['lobbySize'],content['description'],content['location'],content['lobby'],content['tags'])
        return jsonify(
            status=True,
            text='Worked',
            username=content['owner']
        ),200
    else:
        return "wtf?",401


app.run(host='0.0.0.0', port=8090,debug=True)
