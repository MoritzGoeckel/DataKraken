module.exports = class{

    getUTCTimestamp(){
        return new Date().getTime();
    }

    getUTCDate(){
        let now = new Date();
        return  now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds() + "_" + now.getUTCMilliseconds() + " " + now.getUTCDate() + "." + now.getUTCMonth() + "." +  now.getUTCFullYear();
    }

    getUTCTimeOfDay(){
        let date = this.getUTCDate();
        return date.getUTCHours() / 24 + date.getUTCMinutes() / 24 / 60 + date.getUTCSeconds() / 24 / 60 / 60;
    }

}