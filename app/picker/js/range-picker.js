function smRangePicker (picker){
  return{
    restrict : 'E',
    require : ['^?ngModel','smRangePicker'],
    scope:{
      format:'@',
      divider: '@',
      weekStartDay :"@",
      customToHome: "@",
      closeOnSelect: "@",
      mode: "@",      
      showCustom:'@',
      customList: '=',
      minDate : '@',
      maxDate : '@',          
      rangeSelectCall : '&'      
    },
    terminal:true,
    controller: ['$scope','picker',RangePickerCtrl],
    controllerAs : 'vm',
    bindToController:true,
    templateUrl : 'picker/range-picker.html',
    link : function(scope,element,att,ctrls){
      var ngModelCtrl = ctrls[0];
      var calCtrl = ctrls[1];
      calCtrl.configureNgModel(ngModelCtrl);
    }    
  }
}

var RangePickerCtrl = function($scope,picker){
  var self = this;
  self.scope = $scope;
  self.clickedButton = 0;
  self.startShowCustomSettting =self.showCustom;


  self.startDate = moment();
  self.endDate = moment();

  self.divider = angular.isUndefined(self.scope.divider) || self.scope.divider ===''? picker.rangeDivider : $scope.divider;

  self.okLabel = picker.okLabel;
  self.cancelLabel = picker.cancelLabel;
  self.view = 'DATE';

  self.rangeCustomStartEnd = picker.rangeCustomStartEnd;
  var defaultList = [];
  angular.copy(picker.rangeDefaultList,defaultList);
  self.rangeDefaultList =  defaultList;
  if(self.customList){
    for (var i = 0; i < self.customList.length; i++) {
      self.rangeDefaultList[self.customList[i].position] = self.customList[i];
    }
  }

  if(self.showCustom){
    self.selectedTabIndex=0;    
  }else{
    self.selectedTabIndex = $scope.selectedTabIndex;
  }

}

RangePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;
    var self = this;
    ngModelCtrl.$render = function() {
      self.ngModelCtrl.$viewValue= self.startDate+' '+ self.divider +' '+self.endDate;
    };
};

RangePickerCtrl.prototype.setNextView = function(){
  switch (this.mode){
    case  'date':
        this.view = 'DATE';             
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }
      break;
    case  'date-time':
      if(this.view === 'DATE'){
        this.view = 'TIME';
      }else{
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }
      }
      break;
    default:
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
          this.selectedTabIndex =1 
        }        
  }    
} 

RangePickerCtrl.prototype.showCustomView = function(){
  this.showCustom=true;
  this.selectedTabIndex=0

}

RangePickerCtrl.prototype.dateRangeSelected = function(){
    var self = this;
    self.selectedTabIndex =0;
    self.view= 'DATE';
    if(self.startShowCustomSettting){
      self.showCustom=true;
    }else{
      self.showCustom=false;
    }
    self.setNgModelValue(self.startDate,self.divider,self.endDate);
}


RangePickerCtrl.prototype.startDateSelected = function(date){
  this.startDate = date;
  this.scope.$emit('range-picker:startDateSelected');
  this.setNextView();
}

RangePickerCtrl.prototype.startTimeSelected = function(time){

  this.startDate.hour(time.hour()).minute(time.minute());
  this.scope.$emit('range-picker:startTimeSelected');
  this.setNextView();
}


RangePickerCtrl.prototype.endDateSelected = function(date){
  this.endDate = date;
  this.scope.$emit('range-picker:endDateSelected');
  if(this.closeOnSelect && this.mode==='date'){
    this.setNgModelValue(this.startDate,this.divider,this.endDate);
  }else{
    this.setNextView();
  }
}

RangePickerCtrl.prototype.endTimeSelected = function(time){
  this.endDate.hour(time.hour()).minute(time.minute());
  this.scope.$emit('range-picker:endTimeSelected');  
  if(this.closeOnSelect && this.mode==='date-time'){
    this.setNgModelValue(this.startDate,this.divider,this.endDate);    
  }
}


RangePickerCtrl.prototype.setNgModelValue = function(startDate,divider,endDate) {
    var self = this;
    var range = {startDate: startDate.format(self.format) , endDate: endDate.format(self.format)};
    self.rangeSelectCall({range: range});
    self.ngModelCtrl.$setViewValue(startDate.format(self.format)+' '+ divider +' '+endDate.format(self.format));
    self.ngModelCtrl.$render();    
    self.selectedTabIndex =0 
    self.view ="DATE";
    self.scope.$emit('range-picker:close');    
};

RangePickerCtrl.prototype.cancel = function(){
  var self = this;
  if(self.customToHome && self.showCustom){
    self.showCustom=false; 
  }else{
    self.selectedTabIndex =0;
    self.showCustom=false; 
    self.scope.$emit('range-picker:close');        
  }
}

var app = angular.module('smDateTimeRangePicker');
app.directive('smRangePicker',['picker',smRangePicker]);