const Holidays = require("date-holidays");

const hd = new Holidays("IN", "AS");

const isHoliday = (date = new Date()) => {
    const holidays = hd.isHoliday(date);

    return holidays ? 1 : 0;
};

module.exports = isHoliday;
