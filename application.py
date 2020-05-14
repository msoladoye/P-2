import os

from flask import Flask, render_template, session, redirect, request, url_for
from flask_socketio import SocketIO, emit
from flask_session import Session
import datetime
from users import User
from channels import Channel

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)
conversations = []
usernames = {}
channels = {'main': {
    'createdBy': 'Server',
    'timeCreated': datetime.datetime.now(),
    'conversations': []
}}
@socketio.on('messageSend')
def getSendMessage(value):
    messageData = {
        'message': value['message'],
        'username': session.get('username').lower(),
        'timestamp': value['timestamp'],
        'channel': value['channel'].lower()
    }
    channels[value['channel']]['conversations'].append(messageData)
    if len(channels[value['channel']]['conversations']) >= 100:
        channels[value['channel']]['conversations'].pop(0)
    emit('messageReceive', {'messageData': messageData}, broadcast=True)


@socketio.on('isTyping')
def isTyping(value):
    emit('isTypingReceive', {'user': value['user'].lower(), 'channel': session.get(
        'channelname').lower()}, broadcast=True)


@socketio.on('isNotTyping')
def isNotTyping(value):
    emit('isNotTypingReceive', {
         'user': value['user'].lower(), 'channel': session.get('channelname').lower()}, broadcast=True)


@socketio.on('newChannel')
def newChannel(value):
    setChannel = Channel(value['channel'].lower(),
                         channels).setChannel(session.get('username'), usernames)
    if setChannel is None:
        emit('newChannelReceive', {
             'newChannel': 'null', 'user': session.get('username').lower()}, broadcast=True)
    else:
        emit('newChannelReceive', {
             'newChannel': value['channel'].lower(), 'user': session.get('username').lower()}, broadcast=True)


@socketio.on('joinChannel')
def joinChannel(value):
    joinChannel = Channel(value['channel'].lower(), channels).joinChannel(
        value['username'].lower(), usernames)
    if joinChannel is None:
        emit('joinChannelReceive', {
             'newChannel': "null", 'user': session.get('username').lower()}, broadcast=True)
    else:
        emit('joinChannelReceive', {
             'newChannel': value['channel'].lower(), 'user': session.get('username').lower()}, broadcast=True)


@socketio.on('leaveGroup')
def leaveGroup(value):
    leaveGroup = Channel(value['channel'].lower(), channels).leaveGroup(
        value['username'].lower(), usernames)
    if joinChannel is None:
        emit('joinChannelReceive', {
             'newChannel': "null", 'user': session.get('username').lower()}, broadcast=True)
    else:
        emit('leaveGroupReceive', {
             'channel': value['channel'].lower(), 'user': session.get('username').lower()}, broadcast=True)


@app.route('/')
def index():
    if session.get('username') is not None:
        userChannels = User(session.get('username'),
                            usernames).getUserChannel()
        if 'channelname' in session:
            return redirect(url_for('channel', current_channel=session.get('channelname')))
        return redirect(url_for('channel', current_channel='main'))
    return redirect(url_for('login'))


@app.route('/login')
def login():
    return render_template('signin.html')


@app.route('/loginprocess', methods=['POST'])
def loginprocess():
    username = request.form.get('username').lower()
    user = User(username, usernames).setUser()
    if user is None:
        return redirect('/login')
    return redirect(url_for('channel', current_channel='main'))


@app.route('/logout')
def logout():
    session['username'] = None
    session['channelname'] = None
    return redirect('/login')


@app.route('/index/<string:current_channel>')
def channel(current_channel):
    try:
        userChannels = User(session.get('username'),
                            usernames).getUserChannel()
        if current_channel in userChannels:
            session['channelname'] = current_channel
            return render_template('index.html', username=session.get('username'), current_channel=current_channel, userChannels=userChannels, allchannels=channels, conversations=channels[current_channel]['conversations'])
        return render_template('index.html', username=session.get('username'), current_channel='main', userChannels=userChannels, allchannels=channels, conversations=channels[current_channel]['conversations'])
    except KeyError:
        # pass
        return redirect('/')
        # return redirect(url_for('channel', current_channel=session.get('channelname')))
