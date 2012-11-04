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
    this.columnType = [];

    var rows = rawData.split("\n");
    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            this.column = cols;
        }else if( i == 2 ) {
            this.columnType = cols;
        }else if( i > 2 && cols.length == this.column.length) {
            this.data.push(cols); 
        }
    }
}

BuildingCSV.prototype.get = function(id, level) {
    var bFinding = false;

    for( var i=0,max=this.data.length; i<max; i++ ) {
        var cols = this.data[i];
        if( cols[0] == id ) {
            bFinding = true;
        }

        if( cols[0] != "" && cols[0] != id && bFinding ) {
            bFinding = false;
        }

        if( bFinding ) {
            if( cols[3] == level ) {
                var obj = {};
                for( var j=0,max=this.column.length; j<max; j++ ) {
                    var value = cols[j];
                    if( this.columnType[j] == "int" ) {
                        value = +value;
                    }else if( this.columnType[j] == "boolean" ) {
                        value = (value.toLowerCase() == "true");
                    }
                    obj[this.column[j]] = value;
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
    this.columnType = [];

    var rows = rawData.split("\n");
    for( var i=1; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( cols.length != 2 ) continue;

        cols[0] = +cols[0];
        cols[1] = +cols[1];
        this.levelXp[cols[0]] = cols[1]; 
        this.data.push(cols);
    }
}

LevelCSV.prototype.getXp = function(level) {
    return this.levelXp[level];
};

LevelCSV.prototype.getLevel = function(xp) {
    for( var i=0; i<this.data.length; i++ ) {
        var cols = this.data[i];
        if( xp < cols[1] ) {
            return cols[0];
        }
    }
};

function TownHallLevelCSV(rawData) {
    this.data = {};

    var rows = rawData.split("\n");
    var column = rows[0].split(",");
    var columnType = rows[1].split(",");
    
    var prevCols = null;
    for( var i=2; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( cols.length != column.length ) continue;
        
        var obj = {};
        for( var j=0; j<cols.length; j++ ) {
            if( cols[j] == "" && prevCols ) {
                cols[j] = prevCols[j];
            }

            var value = cols[j];
            if( columnType[j] == "int" ) {
                value = +value;
            }else if( columnType[j] == "boolean" ) {
                value = (value.toLowerCase() == "true");
            }

            obj[column[j]] = value;
        }

        this.data[cols[0]] = obj;
        prevCols = cols;
    }
}

TownHallLevelCSV.prototype.get = function(level) {
    return this.data[level];
};
