

from flask import Flask, session
import datetime


class Channel():

    def __init__(self, channelname, channels):
        self.channelname = channelname
        self.channels = channels

    def setChannel(self, username, usernames):
        if self.channelname in self.channels:
            return None
        self.channels[self.channelname] = {
            'createdBy': username,
            'timeCreated': datetime.datetime.now(),
            'conversations': []
        }
        usernames[username]['channels'].append(self.channelname)
        session['channelname'] = self.channelname
        return self.channelname

    def getChannel(self):
        if self.channelname in channels:
            session['channelname'] = self.channelname
            return session.get('channelname')
        return None

    def joinChannel(self, username, usernames):
        if self.channelname in usernames[username]['channels']:
            return None
        usernames[username]['channels'].append(self.channelname)
        return self.channelname

    # def leaveGroup(self, username, usernames):
    #     if self.channelname in usernames[username]['channels']:
    #         del usernames[username]['channels']        
    #         session['channelname'] = 'main'
    #         return self.channelname
    #     return None
