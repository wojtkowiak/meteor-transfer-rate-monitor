## Meteor Transfer Rate Monitor

Simple transfer rate statistics for Meteor with a nice monitor widget. 

Measures the amount of data sent per second on the client and server.

#### Why would I need this?

Well for most apps you can just install it out of curiosity :wink:
This package was created mainly to help in the development process. 
I have found it useful just to have a quick overview on how much data arrives at the client and how the data stream looks like.
You can also quickly see how many data is sent and received on the server when you run load tests.
Of course you can also gather the data and use for all kind of statistical purposes.

#### Why it is not debugOnly?

Because I am using it in production :smile:

The widget is used as monitoring tool and the data is used to generate warnings about unusual transfer rates. 
Also on the client I have used it to implement a safety check which disconnects the app when abnormal traffic is detected. 
When somebody tries to attack your server by modifying your client, this can give you extra time to be prepared.   

### Installation

Just add the package to your project with:

`meteor add omega:transfer-rate-monitor`

### Usage

On the client the package publishes two reactive data sources

```javascript
transferRateMonitor.getTransferRate();
transferRateMonitor.getServerTransferRate();
```

Both are returning an object:

```javascript
{
    rateIn: 0,  // bytes per second
    rateOut: 0, // bytes per second
    messagesIn: 0, // messages per second
    messagesOut: 0 // messages per second
}
```

However on the client to get the server stats you need to be subscribed first.
To subscribe call 
```javascript
transferRateMonitor.subscribeForServerTransferRate(myPassword);
```
in `Meteor.startup` or anywhere you want. 

Similary to unsubscribe just invoke `transferRateMonitor.unsubscribeForServerTransferRate();`

The default password is `giveMeStats` and of course can be changed on the server.

To do that run 
```javascript
transferRateMonitor.configure(options);
```
in your `Meteor.startup` on the server.

The default options object looks like this:
```javascript
{
    maxSubscriptions: 10, // limits the amount of clients receiving server stats globally
    allowedUsers: null, // here you can pass an array ou userids allowed to subscribe
    password: 'giveMeStats'
}
```

### Widgets

```html
<body>
    {{>clientTransferRateMonitor}}
    {{>serverTransferRateMonitor topMargin=120}}
```

The server transfer rate monitor widget of course will only work if you have subscribed for the data. You can also pass a `class="..."` parameter to attach any css class to the widget.
If you want you can also take the files from `src/templates` and play with the monitor widget itself - check what can be configured here: [meteor-monitor-widget](https://github.com/wojtkowiak/meteor-monitor-widget).

### That's all :)
