from flask import Flask, session

class User():
    def __init__(self, username, usernames):
        self.username = username
        self.usernames = usernames

    def setUser(self):
        if len(self.username) >= 3:
            if self.username in self.usernames:
                session['username'] = self.username
                return self.username
            self.usernames[self.username] = {
                'username': self.username,
                'channels': ['main']
            }
            session['username'] = self.username
            return self.username
        return None
    def getUserChannel(self):
        return self.usernames[self.username]['channels']
