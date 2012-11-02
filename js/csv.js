/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-02
 * Time: 下午2:47
 *
 */

/**
 * CSV配置文件管理
 */

function BuildingCSV(rawData) {
    this.data = [];
    this.column = [];

    var rows = rawData.split("\n");
    for( var i=0; i<rows.length; i++ ) {
        var row = rows[i];
        var cols = row.split(",");
        if( i == 0 ) {
            this.column = cols;
        }else if( i > 1 && cols.length == this.column.length ) {
            this.data.push(cols); 
        }
    }
}

BuildingCSV.prototype.get = function(id, level) {
    var bFinding = false;

    for( var i=0,max=this.data.length; i<max; i++ ) {
        var row = this.data[i];
        if( row[0] == id ) {
            bFinding = true;
        }

        if( row[0] != "" && row[0] != id && bFinding ) {
            bFinding = false;
        }

        if( bFinding ) {
            if( row[3] == level ) {
                var obj = {};
                for( var j=0,max=this.column.length; j<max; j++ ) {
                    obj[this.column[j]] = row[j];
                }

                return obj;
            }
        }
    }

    return null;
};

function LevelCSV(rawData) {
    this.levelXp = {};
    this.data = [];

    var rows = rawData.split("\n");
    for( var i=0; i<rows.length; i++ ) {
        var row = rows[i];
        var cols = row.split(",");
        if( i > 1 && cols.length == 2 ) {
            this.levelXp[cols[0]] = cols[1]; 
            this.data.push(cols);
        }
    }
}

LevelCSV.prototype.getXp = function(level) {
    return this.levelXp[level];
};

LevelCSV.prototype.getLevel = function(xp) {
    for( var i=0; i<this.data.length; i++ ) {
        var row = this.data[i];
        if( xp < row[1] ) {
            return row[0];
        }
    }
};
