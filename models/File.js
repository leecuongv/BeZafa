const mongoose = require("mongoose");
const autoinc = require("mongoose-plugin-autoinc");
const { formatTimeUTC } = require("../utils/Timezone");
const { STATUS, COLLECTION } = require("../utils/enum");

const fileSchema = mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: COLLECTION.USER,
    },
    name: {
        type: String,
        default: "Untitled"
    },
    url: {
        type: String,
        default: ""
    }

},
    { timestamps: true });


fileSchema.method("toJSON", function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});
const File = mongoose.model(COLLECTION.FILE, fileSchema);
module.exports = File