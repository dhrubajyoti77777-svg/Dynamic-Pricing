const getRuntimeData = () => {
    const now = new Date();

    const hour = now.getHours();
    const day = now.getDay();

    const weekend = (day === 0 || day === 6) ? 1 : 0;

    return {
        hour,
        weekend
    };
};

module.exports = getRuntimeData;