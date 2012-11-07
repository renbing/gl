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

function CSVRowToObject(column, columnType, cols) {
    var obj = {};
    for( var j=0,max=column.length; j<max; j++ ) {
        var value = cols[j];
        if( columnType[j] == "int" ) {
            value = +value;
        }else if( columnType[j] == "boolean" ) {
            value = (value.toLowerCase() == "true");
        }
        obj[column[j]] = value;
    }

    return obj;
}

function BuildingCSV(rawData) {
    this.data = [];
    this.column = [];
    this.columnType = [];

    var rows = rawData.split("\n");
    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            continue;
        }else if( i == 2 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != this.column.length ) continue;

        this.data.push(cols); 
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
                return CSVRowToObject(this.column, this.columnType, cols);
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
    var column = [];
    var columnType = [];
    
    var prevCols = null;
    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != column.length ) continue;
        
        var obj = CSVRowToObject(column, columnType, cols);

        this.data[obj.Level] = obj;
        prevCols = cols;
    }
}

TownHallLevelCSV.prototype.get = function(level) {
    return this.data[level];
};

function CommonCSV(rawData) {
    this.data = {};

    var rows = rawData.split("\n");
    var column = [];
    var columnType = [];

    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != column.length ) continue;

        var obj = CSVRowToObject(column, columnType, cols);
        this.data[obj.ID] = obj;
    }
}

CommonCSV.prototype.get = function(id) {
    return this.data[id];
}

function GlobalCSV(rawData) {

    var rows = rawData.split("\n");
    for( var i=1; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( cols.length != 2 ) {
            continue;
        }
        var key = cols[0];
        var value = cols[1];

        if( !isNaN(value) ) {
            value = +value;
        }
        this[key] = value;
    }
}

function CharacterCSV(rawData) {
    this.data = [];
    this.column = [];
    this.columnType = [];

    var rows = rawData.split("\n");
    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != this.column.length ) continue;

        this.data.push(cols); 
    }
}

CharacterCSV.prototype.get = function(id, level) {
    var bFinding = false;
    var myLevel = 0;

    for( var i=0,max=this.data.length; i<max; i++ ) {
        var cols = this.data[i];
        if( cols[0] == id ) {
            //开始查找
            bFinding = true;
            myLevel = 1;
        }

        if( cols[0] != "" && cols[0] != id && bFinding ) {
            //结束查找
            return null;
        }

        if( bFinding ) {
            if( myLevel == level ) {
                return CSVRowToObject(this.column, this.columnType, cols);
            }

            myLevel += 1;
        }
    }

    return null;
};

CharacterCSV.prototype.getByClass = function(characterClass) {
    var result = [];

    for( var i=0,max=this.data.length; i<max; i++ ) {
        var cols = this.data[i];
        if( cols[2] == characterClass ) {
            result.push(CSVRowToObject(this.column, this.columnType, cols));
        }
    }

    return result;
};
