function error(res, status, message, err) {
    return res.status(status).json({
        ok: false,
        msg: message,
        errors: err
    });
}

function responseWithObject(res, status, key, object) {
    var stringJson = `{ "ok": "true", "${key}": ${JSON.stringify(object)}}`;
    return res.status(status).json(JSON.parse(stringJson));
}

class ResponseHelper {
    static ok(res, key, object) {

        if (key && object)
            return responseWithObject(res, 200, key, object);

        return res.status(200).send(key);
    }

    static error500(res, message, err) {
        return error(res, 500, message, err);
    }

    static error400(res, message, err) {
        return error(res, 400, message, err);
    }

    static error401(res, message, err) {
        return error(res, 401, message, err);
    }

    static error404(res, message, err) {
        return error(res, 404, message, err);
    }

    static created(res, key, object) {
        return responseWithObject(res, 201, key, object);
    }
}

module.exports = ResponseHelper;